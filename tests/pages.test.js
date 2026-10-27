import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { icons, logo, heroArt, serviceVisual } from '../src/visuals.js';
import { services, stages, agents, projects } from '../src/data.js';
import { experienceSection } from '../src/experience.js';
import { referenceHero, unlockSection, journalSection, renderStudio, studioRoutes } from '../src/studio.js';

const source=(await readFile(new URL('../src/app.js',import.meta.url),'utf8')).replace(/^import .+;\n/gm,'');
const routes=[...studioRoutes,'/','/services','/work','/about','/contact','/privacy','/terms',...services.map(s=>`/services/${s.slug}`),...projects.map(p=>`/work/${p.slug}`)];
function renderPage(path){
  const app={innerHTML:''};
  const classList={add(){},remove(){},toggle(){}};
  const document={querySelector(selector){return selector==='#app'?app:null;},querySelectorAll(){return[];},addEventListener(){},body:{classList},title:''};
  const location=new URL(path,'http://localhost:3000');
  const context={document,location,history:{},window:{addEventListener(){},scrollTo(){}},AbortController,AbortSignal,URL,URLSearchParams,Date,icons,logo,heroArt,serviceVisual,services,stages,agents,projects,initMotion:()=>()=>{},experienceSection,bindExperience:()=>{},referenceHero,unlockSection,journalSection,renderStudio,bindStudio:()=>{},requestAnimationFrame:()=>0};
  runInNewContext(source,context,{timeout:1000});
  return {html:app.innerHTML,title:document.title};
}

test('every page renders a semantic main, unique ids, and working internal link targets',()=>{
  for(const path of [...routes,'/missing-page']){
    const {html,title}=renderPage(path);
    assert.equal((html.match(/<main\b/g)||[]).length,1,path);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,path);
    assert.ok(title.startsWith('Aventrixx — '),path);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`duplicate ids on ${path}`);
    for(const [,href] of html.matchAll(/\bhref="([^"]+)"/g)){
      if(!href.startsWith('/'))continue;
      const url=new URL(href,'http://localhost:3000');assert.ok(routes.includes(url.pathname),`${path}: ${href}`);
      if(url.hash){const targetHtml=url.pathname===path?html:renderPage(url.pathname).html;assert.ok(targetHtml.includes(`id="${url.hash.slice(1)}"`),`${path}: missing ${href}`);}
    }
  }
});
test('concepts, demonstration data, and human review are labeled accurately',()=>{
  const home=renderPage('/').html;
  assert.match(home,/ILLUSTRATIVE DATA/);assert.match(home,/DEMO DATA/);assert.match(home,/CONCEPT PROJECT/);assert.match(home,/Human oversight/);
  for(const p of projects){const html=renderPage(`/work/${p.slug}`).html;assert.match(html,/not commissioned client work/);assert.match(html,/no performance outcomes are claimed/);}
  assert.match(renderPage('/services/search-visibility').html,/outcomes depend on competition/);
});
test('contact page includes real fields, validation, consent, spam protection, and selected service',()=>{
  const html=renderPage('/contact?service=market-intelligence').html;
  for(const field of ['name','email','company','service','message','consent','website_check'])assert.ok(html.includes(`name="${field}"`));
  assert.match(html,/<option value="Market Intelligence" selected>/);assert.match(html,/type="email"/);assert.match(html,/minlength="20"/);assert.match(html,/id="form-status"[^>]*role="status"/);
});
