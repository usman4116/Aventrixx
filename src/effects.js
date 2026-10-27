export function initEffects({signal,reduced,pointer}){
  const band=document.querySelector('.kinetic-band');
  const bandTrack=band?.querySelector('.kinetic-track');
  const reading=document.querySelector('.reading-progress i');
  const showcase=document.querySelector('.showcase-section');
  const cards=[...document.querySelectorAll('.showcase-card')];
  const sceneTabs=document.querySelector('.experience-tabs');
  const effectPanels=[...document.querySelectorAll('.project-visual,.experience-stage')];
  let observer;
  function resize(){sceneTabs?.setAttribute('aria-orientation',innerWidth<=767?'horizontal':'vertical');}
  function update(){
    const total=document.documentElement.scrollHeight-innerHeight;
    if(reading)reading.style.transform=`scaleX(${total>0?Math.min(1,scrollY/total):0})`;
    if(reduced.matches){if(bandTrack)bandTrack.style.transform='';cards.forEach(card=>{card.style.removeProperty('--card-angle');card.style.removeProperty('--card-depth');card.style.removeProperty('--card-light');});return;}
    if(bandTrack){const rect=band.getBoundingClientRect();if(rect.top<innerHeight&&rect.bottom>0)bandTrack.style.transform=`translate3d(${-(innerHeight-rect.top)*.24}px,0,0)`;}
    if(showcase?.classList.contains('is-pinned')){
      const rect=showcase.getBoundingClientRect();
      if(rect.top<innerHeight&&rect.bottom>0){
        const focusX=innerWidth*.4;
        let closest=Infinity,selected=0;
        cards.forEach((card,i)=>{
          const bounds=card.getBoundingClientRect();
          const offset=(bounds.left+bounds.width/2-focusX)/innerWidth;
          const amount=Math.min(1,Math.abs(offset)*1.5);
          card.style.setProperty('--card-angle',`${Math.max(-8,Math.min(8,offset*-14))}deg`);
          card.style.setProperty('--card-depth',`${amount*12}px`);
          card.style.setProperty('--card-light',`${1-amount*.28}`);
          if(Math.abs(offset)<closest){closest=Math.abs(offset);selected=i;}
        });
        showcase.dataset.activeCapability=String(selected);
        cards.forEach((card,i)=>card.classList.toggle('is-featured',i===selected));
      }
    }
  }
  function pointerPanel(panel){
    panel.addEventListener('pointermove',event=>{
      if(!pointer.matches||reduced.matches)return;
      const rect=panel.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
      panel.style.setProperty('--tilt-x',`${(y-.5)*-4}deg`);panel.style.setProperty('--tilt-y',`${(x-.5)*5}deg`);
      panel.style.setProperty('--spotlight-x',`${x*100}%`);panel.style.setProperty('--spotlight-y',`${y*100}%`);
    },{passive:true,signal});
    panel.addEventListener('pointerleave',()=>{panel.style.setProperty('--tilt-x','0deg');panel.style.setProperty('--tilt-y','0deg');},{signal});
  }
  effectPanels.forEach(pointerPanel);
  document.querySelectorAll('.button-primary').forEach(button=>{
    button.addEventListener('pointermove',event=>{
      if(!pointer.matches||reduced.matches||button.disabled)return;
      const rect=button.getBoundingClientRect();
      button.style.setProperty('--magnet-x',`${((event.clientX-rect.left)/rect.width-.5)*8}px`);
      button.style.setProperty('--magnet-y',`${((event.clientY-rect.top)/rect.height-.5)*6}px`);
    },{passive:true,signal});
    button.addEventListener('pointerleave',()=>{button.style.setProperty('--magnet-x','0px');button.style.setProperty('--magnet-y','0px');},{signal});
  });
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{entry.target.classList.toggle('effects-visible',entry.isIntersecting);}),{threshold:.05});
  document.querySelectorAll('.hero-art,.experience-stage,.cta-section').forEach(el=>observer.observe(el));
  const reset=()=>{if(reduced.matches||!pointer.matches){effectPanels.forEach(panel=>{panel.style.setProperty('--tilt-x','0deg');panel.style.setProperty('--tilt-y','0deg');});document.querySelectorAll('.button-primary').forEach(button=>{button.style.setProperty('--magnet-x','0px');button.style.setProperty('--magnet-y','0px');});}resize();update();};
  reduced.addEventListener('change',reset,{signal});
  pointer.addEventListener('change',reset,{signal});
  resize();update();
  return {update,resize,destroy:()=>observer?.disconnect()};
}
