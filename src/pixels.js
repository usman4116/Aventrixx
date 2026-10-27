export function initPixelField({signal}){
  const canvas=document.querySelector('.pixel-canvas');
  if(!canvas)return ()=>{};
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)return ()=>{};
  const field=canvas.closest('.pixel-field');
  const hero=field.closest('.signal-hero');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=matchMedia('(hover: hover) and (pointer: fine)');
  let width=0,height=0,frame=0,visible=false,last=0,time=0,px=.5,py=.5,targetX=.5,targetY=.5;
  let spacing=7,pixelSize=4,frameInterval=1000/30;
  const points=[];

  // A small, repeatable noise map keeps the field coherent between frames.
  const noiseMap=new Float32Array(128*128);
  let seed=48271;
  for(let i=0;i<noiseMap.length;i++){seed=(seed*16807)%2147483647;noiseMap[i]=seed/2147483647;}
  function noise(x,y){
    const ix=Math.floor(x),iy=Math.floor(y);
    let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
    const x0=ix&127,x1=(ix+1)&127,y0=(iy&127)*128,y1=((iy+1)&127)*128;
    const a=noiseMap[y0+x0],b=noiseMap[y0+x1],c=noiseMap[y1+x0],d=noiseMap[y1+x1];
    return a+(b-a)*fx+(c-a+(a-b-c+d)*fx)*fy;
  }
  const shades=Array.from({length:32},(_,i)=>`rgba(174,184,179,${i/31*.67})`);
  const greenShades=Array.from({length:32},(_,i)=>`rgba(30,181,117,${i/31*.48})`);
  const clamp=value=>Math.max(0,Math.min(1,value));

  function resize(){
    const rect=field.getBoundingClientRect();width=rect.width;height=rect.height;
    if(!width||!height)return;
    const ratio=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    // Keep the grid crisp and bound the work on large monitors.
    spacing=Math.max(width<768?6:7,Math.ceil(Math.sqrt(width*height/36000)));
    pixelSize=Math.max(3,spacing-3);frameInterval=1000/(width<768?24:30);
    points.length=0;
    const scale=1/Math.min(width,1100);
    for(let y=0;y<height;y+=spacing)for(let x=0;x<width;x+=spacing){
      const random=noiseMap[((Math.floor(y/spacing)*37)&127)*128+((Math.floor(x/spacing)*53)&127)];
      points.push({x,y,u:x*scale,v:y*scale,random,nx:x/width,ny:y/height});
    }
    draw();
  }
  function draw(){
    ctx.fillStyle='#0a0b0d';ctx.fillRect(0,0,width,height);
    const phase=reduced.matches?0:time;
    const driftX=phase*.19,driftY=phase*.095;
    const hasPointer=pointer.matches&&!reduced.matches;
    px+=(targetX-px)*.08;py+=(targetY-py)*.08;
    for(const point of points){
      // Evolving density makes islands gather, flow, and dissolve even
      // when the pointer is still, rather than shifting a fixed dot pattern.
      const warp=noise(point.u*2.1+driftY+17,point.v*2.1-driftX*.6+9)-.5;
      const broad=noise(point.u*3.1+driftX+warp*.85+4,point.v*3.1-driftY+warp*.55+12);
      const detail=noise(point.u*7.8-driftX*.65+28,point.v*7.8+driftY*.7+36);
      const density=broad*.78+detail*.22;
      const core=clamp((density-.39)*4.4);
      const edge=clamp((core-point.random*.48)*3.2);
      if(edge<=0)continue;
      const dx=point.nx-px,dy=point.ny-py;
      const light=hasPointer?Math.max(0,1-(dx*dx+dy*dy)*16)*.1:0;
      const intensity=clamp(edge*(.3+point.random*.54)+light);
      const shade=Math.round(intensity*31);
      if(!shade)continue;
      ctx.fillStyle=point.random>.63&&core>.36?greenShades[shade]:shades[shade];
      ctx.fillRect(point.x,point.y,pixelSize,pixelSize);
    }
    field.classList.add('pixels-ready');
  }
  function animate(now){
    if(!visible||document.hidden||reduced.matches){frame=0;return;}
    const elapsed=now-last;
    if(elapsed>=frameInterval){
      const remainder=elapsed%frameInterval;
      time+=Math.min((elapsed-remainder)/1000,.1);last=now-remainder;draw();
    }
    frame=requestAnimationFrame(animate);
  }
  const stop=()=>{cancelAnimationFrame(frame);frame=0;};
  const start=()=>{if(visible&&!document.hidden&&!reduced.matches&&!frame){last=performance.now();frame=requestAnimationFrame(animate);}};
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:.01});
  observer.observe(field);
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(field);
  hero.addEventListener('pointermove',event=>{
    if(!pointer.matches||reduced.matches)return;
    const rect=field.getBoundingClientRect();
    targetX=clamp((event.clientX-rect.left)/width);targetY=clamp((event.clientY-rect.top)/height);
  },{passive:true,signal});
  hero.addEventListener('pointerleave',()=>{targetX=.5;targetY=.5;},{signal});
  reduced.addEventListener('change',()=>{stop();draw();start();},{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();},{signal});
  resize();
  return ()=>{stop();observer.disconnect();resizeObserver.disconnect();};
}
