import 'dotenv/config'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const port = Number(process.env.PORT || 3000)
const adminUser = process.env.ADMIN_USER || process.env.VITE_ADMIN_USER
const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD
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
    if(!adminUser||!adminPassword) return json(response,503,{error:'Admin-Zugang ist auf dem Server nicht konfiguriert.'})
    try{
      const {username,password}=await readJson(request)
      return username===adminUser&&password===adminPassword
        ? json(response,200,{ok:true})
        : json(response,401,{error:'Benutzername oder Passwort ist falsch.'})
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
