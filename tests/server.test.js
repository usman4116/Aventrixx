import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer, validateInquiry } from '../server.js';
import { services, projects } from '../src/data.js';
import { studioRoutes } from '../src/studio.js';
import { request } from './request.js';

const valid={name:'Test Business',email:'test@example.com',company:'Example',service:'Growth strategy',message:'We want a clearer digital strategy for our business.',consent:true};
test('inquiries require valid fields, known services, consent, and an empty spam trap',()=>{
  assert.ok(validateInquiry(valid).value);
  for(const change of [{name:' '},{email:'bad'},{message:'too short'},{service:'Unknown'},{consent:false},{website_check:'spam'},{company:'x'.repeat(201)}])assert.ok(validateInquiry({...valid,...change}).error);
});
test('direct URLs, assets, private files, and durable inquiry submissions',async(t)=>{
  const dir=await mkdtemp(join(tmpdir(),'aventrixx-test-'));
  const server=createServer({dataDir:dir,rateLimit:100});
  t.after(async()=>{await rm(dir,{recursive:true,force:true});});
  for(const path of [...studioRoutes,'/','/contact','/about','/services','/work','/privacy','/terms',...services.map(s=>`/services/${s.slug}`),...projects.map(p=>`/work/${p.slug}`)]){const res=await request(server,path);assert.equal(res.status,200,path);assert.match(await res.text(),/id="app"/);}
  assert.equal((await request(server,'/missing-page')).status,404);
  for(const path of ['/src/app.js?v=hero-flow-2','/src/pixels.js?v=hero-flow-2','/src/studio.css?v=hero-flow-2']){
    const asset=await request(server,path);assert.equal(asset.status,200);assert.equal(asset.headers['cache-control'],'no-store');
  }
  for(const path of ['/.data/inquiries','/server.js','/package.json','/api/inquiries'])assert.notEqual((await request(server,path)).status,200,path);
  let res=await request(server,'/api/inquiries',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(valid)});
  assert.equal(res.status,201);const result=await res.json();assert.match(result.reference,/^AV-[A-F0-9]{8}$/);
  const files=await readdir(dir);assert.equal(files.length,1);const record=JSON.parse(await readFile(join(dir,files[0]),'utf8'));assert.equal(record.email,valid.email);assert.equal(record.reference,result.reference);assert.equal(record.consent,true);
  res=await request(server,'/api/inquiries',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...valid,consent:false})});assert.equal(res.status,422);assert.equal((await readdir(dir)).length,1);
  res=await request(server,'/api/inquiries',{method:'POST',headers:{'content-type':'application/json',origin:'https://other-site.example'},body:JSON.stringify(valid)});assert.equal(res.status,403);
  res=await request(server,'/api/inquiries',{method:'POST',headers:{'content-type':'application/json'},body:'{broken'});assert.equal(res.status,400);
  res=await request(server,'/api/inquiries',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({...valid,consent:'true'}).toString()});assert.equal(res.status,201);assert.match(await res.text(),/Inquiry received/);
});
test('rate limiting blocks repeated submissions and resets after the window',async(t)=>{
  const dir=await mkdtemp(join(tmpdir(),'aventrixx-limit-'));let now=Date.now();
  const server=createServer({dataDir:dir,rateLimit:1,clock:()=>now});
  t.after(async()=>{await rm(dir,{recursive:true,force:true});});
  const post=()=>request(server,'/api/inquiries',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(valid)});
  assert.equal((await post()).status,201);const blocked=await post();assert.equal(blocked.status,429);assert.ok(blocked.headers['retry-after']);now+=16*60*1000;assert.equal((await post()).status,201);
});
