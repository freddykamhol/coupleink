import { config as loadEnv } from 'dotenv'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
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
const mimeTypes = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'}

const json = (response,status,body) => {
  response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'})
  response.end(JSON.stringify(body))
}

const readJson = request => new Promise((resolve,reject) => {
  let body=''
  request.on('data',chunk=>{ body+=chunk; if(body.length>10_000) reject(new Error('Body too large')) })
  request.on('end',()=>{ try{ resolve(JSON.parse(body||'{}')) }catch(error){ reject(error) } })
  request.on('error',reject)
})

createServer(async (request,response) => {
  const url = new URL(request.url,'http://localhost')
  if(request.method==='POST' && url.pathname==='/api/admin/login'){
    if(!adminCredentials) return json(response,503,{error:'Admin-Zugang ist auf dem Server nicht konfiguriert.'})
    try{
      const {username,password}=await readJson(request)
      return cleanEnv(username)===adminCredentials.user&&cleanEnv(password)===adminCredentials.password
        ? json(response,200,{ok:true})
        : json(response,401,{error:`Benutzername oder Passwort ist falsch. Verwendete Konfiguration: ${adminCredentials.source}.`})
    }catch{ return json(response,400,{error:'Ungültige Anfrage.'}) }
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
