import { config as loadEnv } from 'dotenv'
import Busboy from 'busboy'
import nodemailer from 'nodemailer'
import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync, statSync, unlinkSync } from 'node:fs'
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
// Plesk kann Node mit einem anderen Arbeitsverzeichnis starten. Deshalb wird
// die .env immer relativ zu dieser Startdatei geladen und nicht relativ zu cwd.
loadEnv({path:join(root,'.env'),override:true,quiet:true})

const cleanEnv = value => value?.trim().replace(/^(["'])(.*)\1$/,'$2')
const port = Number(process.env.PORT || 3000)
const uploadRoot = resolve(cleanEnv(process.env.UPLOAD_DIR)||join(root,'uploads'))
const credentialSets = [
  {source:'ADMIN_USER / ADMIN_PASSWORD',user:cleanEnv(process.env.ADMIN_USER),password:cleanEnv(process.env.ADMIN_PASSWORD)},
  {source:'ADMIN_USERNAME / ADMIN_PASSWORD',user:cleanEnv(process.env.ADMIN_USERNAME),password:cleanEnv(process.env.ADMIN_PASSWORD)},
  {source:'VITE_ADMIN_USER / VITE_ADMIN_PASSWORD',user:cleanEnv(process.env.VITE_ADMIN_USER),password:cleanEnv(process.env.VITE_ADMIN_PASSWORD)},
]
const adminCredentials = credentialSets.find(credentials=>credentials.user&&credentials.password)
const adminSessions = new Set()
const mimeTypes = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'}

const json = (response,status,body,headers={}) => {
  response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers})
  response.end(JSON.stringify(body))
}

const listUploads = () => {
  if(!existsSync(uploadRoot)) return []
  const files=[]
  const visit = (directory,parts=[]) => {
    for(const entry of readdirSync(directory,{withFileTypes:true})){
      const nextParts=[...parts,entry.name]
      const target=join(directory,entry.name)
      if(entry.isDirectory()) visit(target,nextParts)
      else if(entry.isFile()&&mimeTypes[extname(entry.name).toLowerCase()]?.startsWith('image/')){
        const [artist]=nextParts
        if(artist) files.push({
          artist,
          src:`uploads/${nextParts.map(encodeURIComponent).join('/')}`,
          filename:entry.name
        })
      }
    }
  }
  visit(uploadRoot)
  return files.sort((a,b)=>a.src.localeCompare(b.src))
}

const galleryStatePath = join(uploadRoot,'gallery-state.json')
const initialArtists = [{id:'fabi',name:'Fabi'},{id:'katharine',name:'Katharine'},{id:'artist-3',name:'Lena'},{id:'artist-4',name:'Max'}]
const initialWorks = ['6562','6404','6632','6722','6489','7446'].map((number,index)=>({id:'w'+(index+1),artist:index%2?'katharine':'fabi',src:'images/IMG_'+number+'.jpg'}))
const readGalleryState = () => existsSync(galleryStatePath)?JSON.parse(readFileSync(galleryStatePath,'utf8')):{artists:initialArtists,overrides:{},deleted:[]}
const gallerySnapshot = (state=readGalleryState()) => {
  const files=[...initialWorks,...listUploads().map(file=>({...file,id:'upload-'+file.src}))].filter(file=>!state.deleted.includes(file.id)).map(file=>({...file,artist:state.overrides[file.id]||file.artist}))
  const artists=[...state.artists]
  for(const file of files) if(!artists.some(artist=>artist.id===file.artist)) artists.push({id:file.artist,name:file.artist})
  return {artists,files}
}
const updateGallery = body => {
  const state=readGalleryState(),snapshot=gallerySnapshot(state)
  if(body.action==='delete'||body.action==='move'){
    if(!Array.isArray(body.ids)||!body.ids.length||body.ids.some(id=>typeof id!=='string'||!snapshot.files.some(file=>file.id===id))) throw new Error('Bild nicht mehr vorhanden. Bitte Galerie neu laden.')
    if(body.action==='move'){
      if(!snapshot.artists.some(artist=>artist.id===body.artist)) throw new Error('Artist nicht vorhanden.')
      for(const id of body.ids) state.overrides[id]=body.artist
    }else state.deleted=[...new Set([...state.deleted,...body.ids])]
  }else if(body.action==='artist'){
    if(typeof body.id!=='string'||!/^[-a-z0-9_]{1,60}$/.test(body.id)||typeof body.name!=='string'||!body.name.trim()||body.name.length>30) throw new Error('Ung?ltiger Artist.')
    state.artists=snapshot.artists
    const artist=state.artists.find(artist=>artist.id===body.id)
    if(artist) artist.name=body.name.trim()
    else state.artists.push({id:body.id,name:body.name.trim()})
  }else throw new Error('Ung?ltige Galerie-Aktion.')
  mkdirSync(uploadRoot,{recursive:true})
  const temporary=galleryStatePath+'.'+randomUUID()+'.tmp'
  writeFileSync(temporary,JSON.stringify(state),'utf8')
  renameSync(temporary,galleryStatePath)
  return gallerySnapshot(state)
}

const readJson = request => new Promise((resolve,reject) => {
  let body=''
  request.on('data',chunk=>{ body+=chunk; if(body.length>10_000) reject(new Error('Body too large')) })
  request.on('end',()=>{ try{ resolve(JSON.parse(body||'{}')) }catch(error){ reject(error) } })
  request.on('error',reject)
})

const receiveInquiry = request => new Promise((resolve,reject) => {
  const fields={}
  const attachments=[]
  const pending=[]
  let totalSize=0
  const parser=Busboy({headers:request.headers,limits:{files:10,fileSize:10*1024*1024,fields:30,fieldSize:20_000}})
  parser.on('field',(name,value)=>{ fields[name]=value.trim() })
  parser.on('file',(name,file,info)=>{
    if(name!=='references'||!['image/jpeg','image/png','image/webp'].includes(info.mimeType)){ file.resume(); return }
    pending.push(new Promise((done,fail)=>{
      const chunks=[]
      let limited=false
      file.on('data',chunk=>{
        totalSize+=chunk.length
        if(totalSize>25*1024*1024){ limited=true; file.resume() }
        else chunks.push(chunk)
      })
      file.on('limit',()=>{ limited=true })
      file.on('end',()=>{
        if(limited) fail(new Error('Die Referenzbilder sind zu groß. Maximal 10 MB pro Bild und 25 MB insgesamt.'))
        else { attachments.push({filename:info.filename,content:Buffer.concat(chunks),contentType:info.mimeType}); done() }
      })
      file.on('error',fail)
    }))
  })
  parser.on('close',async()=>{ try{ await Promise.all(pending); resolve({fields,attachments}) }catch(error){ reject(error) } })
  parser.on('error',reject)
  request.pipe(parser)
})

const sendInquiry = async ({fields,attachments}) => {
  const smtpHost=cleanEnv(process.env.SMTP_HOST)
  const smtpPort=Number(cleanEnv(process.env.SMTP_PORT)||587)
  const smtpUser=cleanEnv(process.env.SMTP_USER)
  const smtpPassword=cleanEnv(process.env.SMTP_PASSWORD)
  const smtpFrom=cleanEnv(process.env.SMTP_FROM)||smtpUser
  if(!smtpHost||!smtpUser||!smtpPassword||!smtpFrom) throw new Error('SMTP ist auf dem Server nicht vollständig konfiguriert.')
  const required=['idea','style','placement','size','firstname','lastname','email','phone','age']
  if(required.some(name=>!fields[name])) throw new Error('Bitte alle Pflichtfelder ausfüllen.')
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) throw new Error('Bitte eine gültige E-Mail-Adresse angeben.')
  const labels={idea:'Wunschmotiv',style:'Stilrichtung',artist:'Wunsch-Artist',placement:'Körperstelle',size:'Größe',color:'Farbwunsch',skin:'Vorhandenes Tattoo',budget:'Budget',timing:'Wunschzeitraum',firstname:'Vorname',lastname:'Nachname',email:'E-Mail',phone:'Telefon',age:'Alter',contactway:'Bevorzugter Kontakt'}
  const text=Object.entries(labels).map(([name,label])=>`${label}: ${fields[name]||'–'}`).join('\n')
  const transporter=nodemailer.createTransport({
    host:smtpHost,
    port:smtpPort,
    secure:(cleanEnv(process.env.SMTP_SECURE)||String(smtpPort===465)).toLowerCase()==='true',
    auth:{user:smtpUser,pass:smtpPassword}
  })
  await transporter.sendMail({
    from:smtpFrom,
    to:'kontakt@coupleink.de',
    replyTo:fields.email,
    subject:`Neue Tattoo-Anfrage von ${fields.firstname} ${fields.lastname}`,
    text:`Neue Anfrage über coupleink.de\n\n${text}`,
    attachments
  })
}

const isAdmin = request => {
  const cookies = Object.fromEntries((request.headers.cookie||'').split(';').map(value=>value.trim().split('=')))
  return Boolean(cookies.coupleink_admin&&adminSessions.has(cookies.coupleink_admin))
}

const receiveUploads = request => new Promise((resolve,reject) => {
  const now=new Date(),year=String(now.getFullYear()).slice(-2),month=String(now.getMonth()+1).padStart(2,'0')
  let artist=''
  const uploaded=[]
  const pending=[]
  const parser=Busboy({headers:request.headers,limits:{files:30,fileSize:10*1024*1024,fields:5}})
  parser.on('field',(name,value)=>{ if(name==='artist') artist=value.toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,60) })
  parser.on('file',(name,file,info)=>{
    const extensions={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'},extension=extensions[info.mimeType]
    if(name!=='images'||!extension){ file.resume(); return }
    if(!artist){ file.resume(); reject(new Error('Artist fehlt')); return }
    const directory=join(uploadRoot,artist,year,month)
    mkdirSync(directory,{recursive:true})
    const filename=`${randomUUID()}${extension}`,target=join(directory,filename),writer=createWriteStream(target,{flags:'wx'})
    let limited=false
    file.on('limit',()=>{ limited=true })
    file.pipe(writer)
    pending.push(new Promise((done,fail)=>{
      writer.on('finish',()=>{ if(limited){ unlinkSync(target); fail(new Error('Datei ist größer als 10 MB')) } else { uploaded.push({src:`uploads/${artist}/${year}/${month}/${filename}`,filename:info.filename}); done() } })
      writer.on('error',fail)
    }))
  })
  parser.on('close',async()=>{ try{ await Promise.all(pending); if(!uploaded.length) throw new Error('Keine gültigen Bilder empfangen'); resolve(uploaded) }catch(error){ reject(error) } })
  parser.on('error',reject)
  request.pipe(parser)
})

createServer(async (request,response) => {
  const url = new URL(request.url,'http://localhost')
  if(request.method==='POST' && url.pathname==='/api/admin/login'){
    if(!adminCredentials) return json(response,503,{error:'Admin-Zugang ist auf dem Server nicht konfiguriert.'})
    try{
      const {username,password}=await readJson(request)
      if(cleanEnv(username)===adminCredentials.user&&cleanEnv(password)===adminCredentials.password){
        const token=randomUUID(); adminSessions.add(token)
        return json(response,200,{ok:true},{'Set-Cookie':`coupleink_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`})
      }
      return json(response,401,{error:`Benutzername oder Passwort ist falsch. Verwendete Konfiguration: ${adminCredentials.source}.`})
    }catch{ return json(response,400,{error:'Ungültige Anfrage.'}) }
  }

  if(request.method==='POST' && url.pathname==='/api/admin/uploads'){
    if(!isAdmin(request)) return json(response,401,{error:'Bitte erneut anmelden.'})
    try{ return json(response,201,{files:await receiveUploads(request)}) }
    catch(error){ return json(response,400,{error:error.message||'Upload fehlgeschlagen.'}) }
  }

  if(request.method==='POST' && url.pathname==='/api/admin/gallery'){
    if(!isAdmin(request)) return json(response,401,{error:'Bitte erneut anmelden.'})
    try{ return json(response,200,updateGallery(await readJson(request))) }
    catch(error){ return json(response,400,{error:error.message||'Speichern fehlgeschlagen.'}) }
  }

  if(request.method==='POST' && url.pathname==='/api/inquiries'){
    try{
      const inquiry=await receiveInquiry(request)
      await sendInquiry(inquiry)
      return json(response,201,{ok:true})
    }catch(error){ return json(response,400,{error:error.message||'Anfrage konnte nicht gesendet werden.'}) }
  }

  if(request.method==='GET' && url.pathname==='/api/gallery'){
    try{ return json(response,200,gallerySnapshot()) }
    catch(error){ return json(response,500,{error:'Galerie konnte nicht geladen werden.'}) }
  }

  if(request.method!=='GET'&&request.method!=='HEAD') return json(response,405,{error:'Methode nicht erlaubt.'})
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html'
  if(!['index.html','favicon.svg','icons.svg'].includes(relative)&&!['assets/','images/','uploads/'].some(prefix=>relative.startsWith(prefix))) return json(response,404,{error:'Nicht gefunden.'})
  if(relative.split('/').some(part=>part.startsWith('.'))||relative.endsWith('.json')||relative.endsWith('.tmp')) return json(response,404,{error:'Nicht gefunden.'})
  if(relative.startsWith('images/')||relative.startsWith('uploads/')){
    try{
      const id=relative.startsWith('uploads/')?'upload-uploads/'+relative.slice(8).split('/').map(encodeURIComponent).join('/'):initialWorks.find(work=>work.src===relative)?.id
      if(id&&readGalleryState().deleted.includes(id)) return json(response,404,{error:'Bild nicht gefunden.'})
    }catch{ return json(response,500,{error:'Bild konnte nicht geladen werden.'}) }
  }
  const servesUpload = relative.startsWith('uploads/')
  const servingRoot = servesUpload?uploadRoot:root
  const servingPath = servesUpload?relative.slice('uploads/'.length):relative
  const filePath = normalize(join(servingRoot,servingPath))
  if(filePath!==servingRoot&&!filePath.startsWith(`${servingRoot}${sep}`)) return json(response,403,{error:'Zugriff verweigert.'})
  const exists = existsSync(filePath)&&statSync(filePath).isFile()
  if(servesUpload&&!exists) return json(response,404,{error:'Bild nicht gefunden.'})
  const target = exists?filePath:join(root,'index.html')
  response.writeHead(200,{'Content-Type':mimeTypes[extname(target).toLowerCase()]||'application/octet-stream'})
  if(request.method==='HEAD') return response.end()
  createReadStream(target).pipe(response)
}).listen(port,'0.0.0.0',()=>console.log(`Coupleink läuft auf Port ${port}`))
