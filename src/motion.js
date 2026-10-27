import { initEffects } from './effects.js';
import { initPixelField } from './pixels.js?v=hero-flow-2';

export function initMotion() {
  const abort=new AbortController();
  const {signal}=abort;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=matchMedia('(hover: hover) and (pointer: fine)');
  const effects=initEffects({signal,reduced,pointer});
  const cleanupPixels=initPixelField({signal});
  const header=document.querySelector('.site-header');
  const showcase=document.querySelector('.showcase-section');
  const sticky=showcase?.querySelector('.showcase-sticky');
  const viewport=showcase?.querySelector('.showcase-viewport');
  const track=showcase?.querySelector('.showcase-track');
  const progressBar=showcase?.querySelector('.showcase-progress i');
  const hero=document.querySelector('.hero');
  const art=hero?.querySelector('.hero-art');
  let desktop=false,travel=0,distance=0,stickyTop=64,frame=0,observer,visualObserver;
  function setupReveals(){
    observer?.disconnect();
    visualObserver?.disconnect();
    document.documentElement.classList.toggle('motion-ready',!reduced.matches);
    if(reduced.matches){document.querySelectorAll('.reveal').forEach(el=>el.classList.add('revealed'));document.querySelectorAll('.service-visual,.agent-interactive').forEach(el=>el.classList.add('visual-in-view'));return;}
    observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);} }),{threshold:.08,rootMargin:'0px 0px -30px 0px'});
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el=>observer.observe(el));
    visualObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting)entry.target.classList.add('visual-in-view');
      entry.target.classList.toggle('animation-paused',!entry.isIntersecting);
    }),{threshold:.15});
    document.querySelectorAll('.service-visual,.agent-interactive,.hero-art').forEach(el=>visualObserver.observe(el));
  }
  function resize(){
    effects.resize();
    const tabs=document.querySelector('.process-tabs');
    tabs?.setAttribute('aria-orientation',window.innerWidth<=767?'horizontal':'vertical');
    if(!showcase)return;
    const previousProgress=getProgress();
    desktop=window.innerWidth>=1000&&window.innerHeight>=650&&!reduced.matches;
    showcase.classList.toggle('is-pinned',desktop);
    if(desktop&&sticky.offsetHeight>window.innerHeight-76){desktop=false;showcase.classList.remove('is-pinned');}
    track.style.transform='';
    viewport.scrollLeft=0;
    const viewportStyle=getComputedStyle(viewport);
    const totalWidth=track.scrollWidth+parseFloat(viewportStyle.paddingLeft)+parseFloat(viewportStyle.paddingRight);
    travel=Math.max(0,totalWidth-viewport.clientWidth);
    if(desktop){stickyTop=parseFloat(getComputedStyle(sticky).top)||64;distance=travel*.8;showcase.style.height=`${sticky.offsetHeight+distance}px`;}else{showcase.style.height='';distance=0;viewport.scrollLeft=previousProgress*travel;}
    update();
  }
  function getProgress(){if(!showcase)return 0;if(desktop)return Math.min(1,Math.max(0,(stickyTop-showcase.getBoundingClientRect().top)/Math.max(distance,1)));return travel?viewport.scrollLeft/travel:0;}
  function update(){
    frame=0;header?.classList.toggle('scrolled',window.scrollY>30);
    if(showcase){const progress=getProgress();if(desktop)track.style.transform=`translate3d(${-travel*progress}px,0,0)`;progressBar.style.transform=`scaleX(${Math.max(.08,progress)})`;const prev=showcase.querySelector('.showcase-prev'),next=showcase.querySelector('.showcase-next');prev.disabled=progress<=.002;next.disabled=progress>=.998;}
    if(hero&&!reduced.matches){const amount=Math.min(window.scrollY/800,1);hero.style.setProperty('--scroll-depth',`${amount*70}px`);}
    effects.update();
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  function advance(direction){
    if(desktop){const amount=(track.querySelector('.showcase-card').offsetWidth+24)/travel;const target=Math.min(1,Math.max(0,getProgress()+direction*amount));window.scrollTo({top:window.scrollY+showcase.getBoundingClientRect().top-stickyTop+distance*target,behavior:'smooth'});}
    else viewport.scrollBy({left:direction*(track.querySelector('.showcase-card').offsetWidth+parseFloat(getComputedStyle(track).gap)),behavior:reduced.matches?'instant':'smooth'});
  }
  showcase?.querySelector('.showcase-prev').addEventListener('click',()=>advance(-1),{signal});
  showcase?.querySelector('.showcase-next').addEventListener('click',()=>advance(1),{signal});
  viewport?.addEventListener('scroll',schedule,{passive:true,signal});
  viewport?.addEventListener('keydown',e=>{if(e.target!==viewport)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();advance(e.key==='ArrowRight'?1:-1);}},{signal});
  track?.addEventListener('focusin',e=>{if(!desktop)return;const card=e.target.closest('.showcase-card');if(!card)return;const left=card.offsetLeft;const current=getProgress()*travel;if(left<current||left+card.offsetWidth>current+viewport.clientWidth){const target=Math.min(travel,Math.max(0,left-60));window.scrollTo({top:window.scrollY+showcase.getBoundingClientRect().top-stickyTop+distance*(target/travel),behavior:'instant'});}},{signal});
  window.addEventListener('scroll',schedule,{passive:true,signal});
  window.addEventListener('resize',resize,{passive:true,signal});
  reduced.addEventListener('change',()=>{setupReveals();resize();},{signal});
  if(art&&pointer.matches&&!reduced.matches){hero.addEventListener('pointermove',e=>{if(reduced.matches)return;const bounds=hero.getBoundingClientRect();art.style.setProperty('--pointer-x',`${(e.clientX/bounds.width-.5)*15}px`);art.style.setProperty('--pointer-y',`${(e.clientY/bounds.height-.5)*12}px`);},{passive:true,signal});hero.addEventListener('pointerleave',()=>{art.style.setProperty('--pointer-x','0px');art.style.setProperty('--pointer-y','0px');},{signal});}
  if(pointer.matches)document.querySelectorAll('.service-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(reduced.matches)return;const rect=card.getBoundingClientRect();card.style.setProperty('--light-x',`${e.clientX-rect.left}px`);card.style.setProperty('--light-y',`${e.clientY-rect.top}px`);},{passive:true,signal});});
  setupReveals();resize();update();
  document.fonts?.ready.then(()=>{if(!signal.aborted)resize();});
  return ()=>{abort.abort();observer?.disconnect();visualObserver?.disconnect();effects.destroy();cleanupPixels();cancelAnimationFrame(frame);};
}
