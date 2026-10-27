import http from 'node:http';
import { readFile, mkdir, writeFile, readdir, unlink, stat } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { services, projects } from './src/data.js';
import { studioRoutes } from './src/studio.js';
import { embeddedAssets } from './src/assets.generated.js';

const root=dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2'};
const routes=new Set([...studioRoutes,'/','/services','/work','/about','/contact','/privacy','/terms',...services.map(s=>`/services/${s.slug}`),...projects.map(p=>`/work/${p.slug}`)]);
import { interests, validateInquiry } from './src/validate.js';
export { validateInquiry };
const retentionMs=365*24*60*60*1000;

export function createRequestHandler({dataDir=process.env.INQUIRY_DATA_DIR||(process.env.VERCEL?resolve(tmpdir(),'aventrixx-inquiries'):resolve(root,'.data','inquiries')),clock=()=>Date.now(),rateLimit=5}={}) {
  const attempts=new Map();
  let lastSweep=0;
  async function sweep(){
    try {
      if(clock()-lastSweep<24*60*60*1000)return;
      await mkdir(dataDir,{recursive:true,mode:0o700});
      const files=await readdir(dataDir);
      await Promise.all(files.filter(f=>f.endsWith('.json')).map(async f=>{const path=resolve(dataDir,f);const s=await stat(path);if(clock()-s.mtimeMs>retentionMs)await unlink(path);}));
      lastSweep=clock();
    } catch {}
  }
  return async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
    const json=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
    try {
      const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);
      if(url.pathname==='/api/health'){
        if(req.method!=='GET')return json(405,{error:'Method not allowed.'});
        const cwd=process.cwd();
        const dir=dirname(fileURLToPath(import.meta.url));
        const cwdFiles=await readdir(cwd).catch(e=>e.message);
        const srcFiles=await readdir(resolve(cwd,'src')).catch(e=>e.message);
        const dirFiles=await readdir(dir).catch(e=>e.message);
        return json(200,{status:'ok',cwd,dir,cwdFiles,srcFiles,dirFiles});
      }
      if(url.pathname==='/api/inquiries'){
        if(req.method!=='POST'){res.setHeader('Allow','POST');return json(405,{error:'Method not allowed.'});}
        if(req.headers.origin){let origin;try{origin=new URL(req.headers.origin);}catch{return json(403,{error:'This request origin is not allowed.'});}if(origin.host!==req.headers.host)return json(403,{error:'This request origin is not allowed.'});}
        const contentType=(req.headers['content-type']||'').split(';')[0];
        if(!['application/json','application/x-www-form-urlencoded'].includes(contentType))return json(415,{error:'Please submit the inquiry form.'});
        if(Number(req.headers['content-length'])>20000)return json(413,{error:'The inquiry is too large.'});
        const now=clock();
        const forwarded=req.headers['x-forwarded-for'];
        const address=(typeof forwarded==='string'?forwarded.split(',')[0].trim():null)||req.socket?.remoteAddress||'unknown';
        for(const[key,value]of attempts)if(now-value.start>15*60*1000)attempts.delete(key);
        const current=attempts.get(address)||{start:now,count:0};current.count++;attempts.set(address,current);
        if(current.count>rateLimit){res.setHeader('Retry-After',String(Math.ceil((current.start+15*60*1000-now)/1000)));return json(429,{error:'Too many submissions. Please try again in 15 minutes.'});}
        let data;
        if(req.body&&typeof req.body==='object'){
          data=req.body;
        }else if(typeof req.body==='string'&&req.body.length>0){
          try{data=contentType==='application/json'?JSON.parse(req.body):Object.fromEntries(new URLSearchParams(req.body));}catch{return json(400,{error:'The submission format is invalid.'});}
        }else{
          let body='';
          for await (const chunk of req){body+=chunk;if(Buffer.byteLength(body)>20000)return json(413,{error:'The inquiry is too large.'});}
          try{data=contentType==='application/json'?JSON.parse(body):Object.fromEntries(new URLSearchParams(body));}catch{return json(400,{error:'The submission format is invalid.'});}
        }
        const checked=validateInquiry(data);if(checked.error)return json(422,{error:checked.error});
        const id=randomUUID(),reference=`AV-${id.slice(0,8).toUpperCase()}`;
        try{
          await sweep();
          await mkdir(dataDir,{recursive:true,mode:0o700});
          await writeFile(resolve(dataDir,`${id}.json`),JSON.stringify({id,reference,createdAt:new Date(now).toISOString(),...checked.value},null,2),{flag:'wx',mode:0o600});
        }catch(err){console.error('Storage note:',err.message);}
        if(contentType==='application/x-www-form-urlencoded'){res.writeHead(201,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inquiry received — Aventrixx</title><link rel="stylesheet" href="/src/styles.css"><main class="noscript"><h1>Inquiry received.</h1><p>Your inquiry has been saved. Reference: ${reference}. We’ll use your email to discuss a discovery conversation.</p><a href="/">Return to Aventrixx →</a></main></html>`);}
        return json(201,{success:true,reference});
      }
      if(url.pathname.startsWith('/api/'))return json(404,{error:'Endpoint not found.'});
      if(req.method!=='GET'&&req.method!=='HEAD'){res.setHeader('Allow','GET, HEAD');return json(405,{error:'Method not allowed.'});}
      let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{return json(400,{error:'Invalid path.'});}
      const isAsset=pathname.startsWith('/src/')||pathname.startsWith('/public/');
      if(isAsset){
        const ext=extname(pathname);
        if(!['.js','.css','.svg','.png','.webp','.ico','.woff2'].includes(ext))return json(404,{error:'Asset not found.'});
        let content;
        for(const base of [process.cwd(),root]){
          const file=resolve(base,`.${pathname}`);
          const allowed=pathname.startsWith('/src/')?resolve(base,'src')+sep:resolve(base,'public')+sep;
          if(file.startsWith(allowed)){try{content=await readFile(file);break;}catch{}}
        }
        if(!content&&embeddedAssets.has(pathname)){content=embeddedAssets.get(pathname);}
        if(!content)return json(404,{error:'Asset not found.'});
        const cacheControl=pathname.startsWith('/src/')?'no-store':'public, max-age=3600';
        res.writeHead(200,{'Content-Type':mime[ext],'Cache-Control':cacheControl});return res.end(req.method==='HEAD'?undefined:content);
      }
      if(pathname.startsWith('/.')||(extname(pathname)&&pathname!=='/index.html'))return json(404,{error:'Not found.'});
      let content;
      for(const base of [process.cwd(),root]){try{content=await readFile(resolve(base,'index.html'));break;}catch{}}
      if(!content&&embeddedAssets.has('/index.html')){content=embeddedAssets.get('/index.html');}
      if(!content)return json(500,{error:'Template missing.'});
      const normalized=pathname.replace(/\/$/,'')||'/';
      const isHtmlRoute=normalized==='/index.html'||routes.has(normalized);
      res.writeHead(isHtmlRoute?200:404,{'Content-Type':mime['.html'],'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:content);
    } catch(error){console.error('Request failed:',error.code||error.name);if(!res.headersSent)json(500,{error:'Your inquiry could not be saved. Please try again later.'});else res.end();}
  };
}

export function createServer(options={}) {
  return http.createServer(createRequestHandler(options));
}

const defaultHandler = createRequestHandler();

export default function handler(req, res) {
  return defaultHandler(req, res);
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT)||3000;
  const server=createServer({dataDir:process.env.INQUIRY_DATA_DIR?resolve(process.env.INQUIRY_DATA_DIR):undefined});
  server.listen(port,process.env.HOST||'0.0.0.0',()=>console.log(`Aventrixx is ready at http://localhost:${port}`));
}
