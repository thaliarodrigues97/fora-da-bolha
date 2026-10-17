import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const config=JSON.parse(await fs.readFile('vercel.json','utf8'));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  for(const header of config.headers[0].headers)res.setHeader(header.key,header.key==='Content-Security-Policy'?header.value.replace('; upgrade-insecure-requests',''):header.value);
  let file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden')}
  if(!path.extname(file))file+='.html';
  let data;try{data=await fs.readFile(file)}catch{res.statusCode=404;file=path.join(root,'404.html');data=await fs.readFile(file)}
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data);
 }catch{res.writeHead(400);res.end('Bad request')}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173 (security headers enabled)'));
