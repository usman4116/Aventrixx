import { icons, serviceVisual, comparisonVisual } from './visuals.js';

export const experienceScenes=[
  {name:'The experience',label:'DIGITAL EXPERIENCE',title:'Same business.<br>A different feeling.',text:'Design shapes the way people see your business. Move the divider to explore how a considered experience changes the first impression.',slug:'digital-presence',number:'01',caption:'Drag to reveal. Feel the difference.'},
  {name:'The perspective',label:'MARKET INTELLIGENCE',title:'Information,<br>with direction.',text:'Bring scattered signals into one clear perspective. Explore an illustrative interface connecting audience behavior and market opportunity.',slug:'market-intelligence',type:'intelligence',number:'02',caption:'A clearer picture of the opportunity.'},
  {name:'The connection',label:'AI-ASSISTED WORKFLOW',title:'Separate tasks.<br>Shared intelligence.',text:'Connected workflows give every task a place in the bigger picture. Human direction guides the research, analysis, and optimization.',slug:'agentic-ai-marketing',type:'ai',number:'03',caption:'Purposeful automation. Human direction.'}
];

export function experiencePanel(index){
  const scene=experienceScenes[index];
  return `<div class="experience-stage-header"><span><i class="tiny-dot violet"></i> ${scene.label}</span><span>EXPLORATION ${scene.number} / 03</span></div><div class="experience-canvas ${scene.type?'canvas-dashboard':'canvas-design'}"><div class="experience-grid"></div><div class="experience-frame">${scene.type?serviceVisual(scene.type,'lab-visual'):comparisonVisual()}</div><span class="experience-coordinate coordinate-top">+ 01.24 / 08.36</span><span class="experience-coordinate coordinate-bottom">+ AV — DESIGN SYSTEM</span></div><div class="experience-stage-footer"><span>${scene.caption}</span><span>CONCEPT DEMONSTRATION ${icons.diagonal}</span></div>`;
}

export function experienceSection(){
  const scene=experienceScenes[0];
  return `<section id="experience" class="experience-section"><div class="container"><div class="section-top"><span><i>AV / LAB</i> POSSIBILITIES IN MOTION</span><span>EXPLORE. INTERACT. IMAGINE.</span></div><div class="experience-heading reveal"><div class="eyebrow"><span class="eyebrow-line"></span> THE EXPERIENCE IS THE DIFFERENCE</div><h2>Don’t just explain it.<br><span class="text-gradient">Let them experience it.</span></h2></div><div class="experience-layout reveal"><div class="experience-sidebar"><div class="experience-tabs" role="tablist" aria-label="Explore our design and technology capabilities" aria-orientation="vertical">${experienceScenes.map((s,i)=>`<button id="experience-tab-${i}" class="experience-tab ${i===0?'selected':''}" data-scene="${i}" role="tab" aria-selected="${i===0}" aria-controls="experience-panel" tabindex="${i===0?'0':'-1'}"><span>0${i+1}</span><strong>${s.name}</strong>${icons.diagonal}</button>`).join('')}</div><div class="experience-copy" aria-live="polite"><span class="experience-scene-label">${scene.label}</span><h3>${scene.title}</h3><p>${scene.text}</p><a class="text-link experience-service-link" href="/services/${scene.slug}">Explore the capability ${icons.diagonal}</a></div><div class="experience-disclosure">DESIGN EXPLORATIONS<br><span>Concept interfaces. Illustrative data.</span></div></div><div id="experience-panel" class="experience-stage" role="tabpanel" aria-labelledby="experience-tab-0">${experiencePanel(0)}</div></div></div></section>`;
}

export function bindExperience(signal){
  const section=document.querySelector('.experience-section');
  if(!section)return;
  const tabs=[...section.querySelectorAll('.experience-tab')];
  const panel=section.querySelector('#experience-panel');
  function bindComparison(){
    const range=panel.querySelector('.comparison-range');
    range?.addEventListener('input',()=>{range.closest('.design-comparison').style.setProperty('--comparison',`${range.value}%`);range.setAttribute('aria-valuetext',`${range.value} percent considered design visible`);},{signal});
  }
  function select(index,focus=false){
    tabs.forEach((tab,i)=>{tab.classList.toggle('selected',i===index);tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    const scene=experienceScenes[index];
    panel.setAttribute('aria-labelledby',`experience-tab-${index}`);panel.innerHTML=experiencePanel(index);panel.dataset.scene=String(index);
    section.querySelector('.experience-copy').innerHTML=`<span class="experience-scene-label">${scene.label}</span><h3>${scene.title}</h3><p>${scene.text}</p><a class="text-link experience-service-link" href="/services/${scene.slug}">Explore the capability ${icons.diagonal}</a>`;
    panel.querySelector('.service-visual')?.classList.add('visual-in-view');
    bindComparison();
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(index),{signal});
    tab.addEventListener('keydown',e=>{let next=index;if(['ArrowDown','ArrowRight'].includes(e.key))next=(index+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))next=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();select(next,true);},{signal});
  });
  bindComparison();
}
