import { config as loadEnv } from 'dotenv'
import Busboy from 'busboy'
import { createReadStream, createWriteStream, existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs'
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
// Plesk kann Node mit einem anderen Arbeitsverzeichnis starten. Deshalb wird
// die .env immer relativ zu dieser Startdatei geladen und nicht relativ zu cwd.
loadEnv({path:join(root,'.env'),override:true,quiet:true})

const cleanEnv = value => value?.trim().replace(/^(["'])(.*)\1$/,'$2')
const port = Number(process.env.PORT || 3000)
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

const readJson = request => new Promise((resolve,reject) => {
  let body=''
  request.on('data',chunk=>{ body+=chunk; if(body.length>10_000) reject(new Error('Body too large')) })
  request.on('end',()=>{ try{ resolve(JSON.parse(body||'{}')) }catch(error){ reject(error) } })
  request.on('error',reject)
})

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
    const directory=join(root,'uploads',artist,year,month)
    mkdirSync(directory,{recursive:true})
    const filename=`${randomUUID()}${extension}`,target=join(directory,filename),writer=createWriteStream(target,{flags:'wx'})
    let limited=false
    file.on('limit',()=>{ limited=true })
    file.pipe(writer)
    pending.push(new Promise((done,fail)=>{
      writer.on('finish',()=>{ if(limited){ unlinkSync(target); fail(new Error('Datei ist größer als 10 MB')) } else { uploaded.push({src:`/uploads/${artist}/${year}/${month}/${filename}`,filename:info.filename}); done() } })
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

  if(request.method!=='GET'&&request.method!=='HEAD') return json(response,405,{error:'Methode nicht erlaubt.'})
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html'
  const filePath = normalize(join(root,relative))
  if(!filePath.startsWith(root)) return json(response,403,{error:'Zugriff verweigert.'})
  const target = existsSync(filePath)&&statSync(filePath).isFile()?filePath:join(root,'index.html')
  response.writeHead(200,{'Content-Type':mimeTypes[extname(target).toLowerCase()]||'application/octet-stream'})
  if(request.method==='HEAD') return response.end()
  createReadStream(target).pipe(response)
}).listen(port,'0.0.0.0',()=>console.log(`Coupleink läuft auf Port ${port}`))
