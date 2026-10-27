export const icons = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  diagonal: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4"/><ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" stroke-width="1.4"/><path d="M3 12h18" stroke="currentColor" stroke-width="1.4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4v16h16M8 15l4-5 4 2 4-7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="m16 16 5 5" stroke="currentColor" stroke-width="1.4"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  network: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 6 6 6-6M6 18l6-6 6 6" stroke="currentColor" stroke-width="1.4"/><circle cx="5" cy="5" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="19" cy="5" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="5" cy="19" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="19" cy="19" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.4"/></svg>',
  growth: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 17 6-6 4 4 8-10M14 5h7v7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
export const logo = '<svg class="brand-mark" viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M3 29 15 6h6l12 23H23l-5-11-5 11Z" fill="currentColor"/><path d="m15 28 3-6 3 6Z" fill="currentColor"/></svg>';

function lightSculpture() {
  // Project a shaded tube mesh into SVG, then paint its faces from back to front.
  const steps=160,sides=16;
  const unit=v=>{const length=Math.hypot(...v);return v.map(x=>x/length);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const curve=t=>{const radius=1.7+.58*Math.cos(3*t);return [radius*Math.cos(2*t),radius*Math.sin(2*t),.58*Math.sin(3*t)];};
  const rotate=([x,y,z])=>{const px=x*Math.cos(.7)+z*Math.sin(.7),pz=-x*Math.sin(.7)+z*Math.cos(.7);return [px,y*Math.cos(.78)-pz*Math.sin(.78),y*Math.sin(.78)+pz*Math.cos(.78)];};
  const light=unit([-.45,-.7,1]);
  const rings=Array.from({length:steps},(_,i)=>{
    const t=i/steps*Math.PI*2,center=curve(t),next=curve(t+.001);
    const tangent=unit(next.map((n,j)=>n-center[j]));
    const normal=unit(cross(tangent,[0,0,1])),binormal=unit(cross(tangent,normal));
    return Array.from({length:sides},(_,j)=>{
      const angle=j/sides*Math.PI*2;
      const surface=normal.map((n,k)=>n*Math.cos(angle)+binormal[k]*Math.sin(angle));
      const position=rotate(center.map((n,k)=>n+surface[k]*.19));
      const worldNormal=rotate(surface);
      const diffuse=Math.max(0,worldNormal.reduce((sum,n,k)=>sum+n*light[k],0));
      const reflection=Math.pow(diffuse,7);
      return {x:320+position[0]*84,y:310+position[1]*84,z:position[2],shade:27+diffuse*35+reflection*24};
    });
  });
  const faces=[];
  for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){
    const vertices=[rings[i][j],rings[(i+1)%steps][j],rings[(i+1)%steps][(j+1)%sides],rings[i][(j+1)%sides]];
    faces.push({vertices,depth:vertices.reduce((sum,v)=>sum+v.z,0)/4,shade:vertices.reduce((sum,v)=>sum+v.shade,0)/4});
  }
  return faces.sort((a,b)=>a.depth-b.depth).map(({vertices,depth,shade})=>{
    const color=`hsl(${270+depth*4} ${Math.round(45-(shade-27)*.25)}% ${Math.round(shade)}%)`;
    return `<polygon points="${vertices.map(v=>`${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ')}" fill="${color}" stroke="${color}" stroke-width=".45" stroke-linejoin="round"/>`;
  }).join('');
}

export function heroArt() {
  return `<div class="hero-art" aria-label="An interconnected growth system, illustrated by luminous orbital paths">
    <div class="art-grid"></div><div class="art-halo"></div><div class="art-aura aura-one"></div><div class="art-aura aura-two"></div>
    <svg class="orbital-art" viewBox="0 0 640 620" fill="none" aria-hidden="true">
      <defs><linearGradient id="orbitGradient" x1="100" y1="120" x2="530" y2="510" gradientUnits="userSpaceOnUse"><stop stop-color="#d8c7ff"/><stop offset=".4" stop-color="#8057de"/><stop offset="1" stop-color="#337ea2"/></linearGradient><radialGradient id="coreGradient"><stop stop-color="#dfceff"/><stop offset=".2" stop-color="#b999f3"/><stop offset=".75" stop-color="#513777"/><stop offset="1" stop-color="#171022"/></radialGradient><linearGradient id="ribbonGradient" x1="202" y1="130" x2="420" y2="450"><stop stop-color="#eee5ff"/><stop offset=".28" stop-color="#bd94ff"/><stop offset=".6" stop-color="#8054cc"/><stop offset="1" stop-color="#302342"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="4"/></filter></defs>
      <g class="orbit-slow"><ellipse cx="320" cy="310" rx="273" ry="115" transform="rotate(-32 320 310)" stroke="url(#orbitGradient)" stroke-opacity=".5"/><ellipse cx="320" cy="310" rx="237" ry="174" transform="rotate(40 320 310)" stroke="url(#orbitGradient)" stroke-opacity=".28"/><ellipse cx="320" cy="310" rx="145" ry="247" transform="rotate(-32 320 310)" stroke="url(#orbitGradient)" stroke-opacity=".35"/></g>
      <ellipse cx="320" cy="310" rx="276" ry="255" stroke="#b79de4" stroke-opacity=".08" stroke-dasharray="3 8"/>
      <path d="M113 396C187 420 265 402 368 339S532 205 531 177" stroke="url(#orbitGradient)" stroke-width="2"/>
      <g class="core-shape">${lightSculpture()}</g>
      <ellipse class="orbit-signal" cx="320" cy="310" rx="273" ry="115" transform="rotate(-32 320 310)" stroke="#dec7ff" stroke-width="2" stroke-dasharray="12 1250" stroke-linecap="round"/>
      <circle cx="113" cy="396" r="5" fill="#b992ff"/><circle cx="113" cy="396" r="11" stroke="#b992ff" stroke-opacity=".3"/><circle cx="531" cy="177" r="4" fill="#b5dfff"/><circle cx="531" cy="177" r="10" stroke="#b5dfff" stroke-opacity=".25"/><circle cx="416" cy="519" r="3" fill="#9a74de"/><circle cx="204" cy="84" r="3" fill="#9a74de"/>
      <path d="M320 38v12m-6-6h12M574 356v12m-6-6h12M64 239v12m-6-6h12" stroke="#87769d" stroke-opacity=".6"/>
    </svg>
    <div class="orbit-label label-strategy"><span class="tiny-dot violet"></span> STRATEGY <span class="label-coordinate">01</span></div>
    <div class="orbit-label label-intelligence"><span class="tiny-dot cyan"></span> INTELLIGENCE <span class="label-coordinate">02</span></div>
    <div class="orbit-label label-growth"><span class="tiny-dot"></span> GROWTH <span class="label-coordinate">03</span></div>
    <div class="art-caption"><span class="status-dot"></span> CONNECTION CREATES POSSIBILITY <span>↗</span></div><span class="art-index" aria-hidden="true">FIG. 001 — THE CONNECTED SYSTEM</span>
  </div>`;
}

export function comparisonVisual() {
  return `<div class="design-comparison" style="--comparison:68%">
    <div class="comparison-base" aria-hidden="true"><div class="basic-site"><div class="basic-nav"><strong>FORM & FIELD</strong><span>Home &nbsp; Products &nbsp; About</span></div><div class="basic-hero"><span>WELCOME TO OUR WEBSITE</span><strong>Quality furniture<br>for your home.</strong><p>Browse our furniture collection.<br>Beautiful products for every space.</p><span class="basic-button">VIEW PRODUCTS</span></div><div class="basic-products"><i></i><i></i><i></i></div></div></div>
    <div class="comparison-enhanced" aria-hidden="true"><div class="designed-site"><div class="designed-nav"><b>form<span>&</span>field</b><span>Objects &nbsp; Our story &nbsp; ↗</span></div><div class="designed-content"><div><span class="designed-kicker">A QUIETER KIND OF EXTRAORDINARY</span><strong>Objects.<br>With <em>soul.</em></strong><p>Thoughtful forms. Honest materials.<br>Designed for a life well lived.</p><span class="designed-button">Explore the collection <span>↗</span></span></div><div class="art-object"><div class="object-shadow"></div><div class="object-ring ring-a"></div><div class="object-ring ring-b"></div><div class="object-ring ring-c"></div><span class="object-pedestal"></span><i class="object-caption">NO. 01 / THE CONTINUUM</i></div></div><div class="designed-footer"><span>LESS, BUT BETTER.</span><span>EST. 2026 &nbsp; · &nbsp; MADE WITH INTENTION</span></div></div></div>
    <div class="comparison-divider" aria-hidden="true"><span>‹ &nbsp; ›</span></div>
    <input class="comparison-range" type="range" min="0" max="100" value="68" aria-label="Reveal the considered design" aria-valuetext="68 percent considered design visible" />
    <div class="comparison-labels" aria-hidden="true"><span>CONSIDERED DESIGN</span><span>BASIC TEMPLATE</span></div>
  </div>`;
}

const windowBar = (label) => `<div class="window-bar"><span class="window-dots"><i></i><i></i><i></i></span><span>${label}</span><span>↗</span></div>`;
export function serviceVisual(type, variant = '') {
  let content = '';
  if (type === 'presence') content = `<div class="browser secondary-browser">${windowBar('MOBILE / RESPONSIVE')}<div class="mobile-preview"><span>STUDIO NORTH</span><div class="mini-sculpture"></div><strong>A different<br>perspective.</strong><i>Explore the collection ↗</i></div></div><div class="browser main-browser">${windowBar('DIGITAL EXPERIENCE')}<div class="website-preview"><div class="preview-nav"><b>FORM & FIELD</b><span>Collection &nbsp; Studio &nbsp; ↗</span></div><div class="preview-hero"><div><span>OBJECTS WITH INTENTION</span><strong>Made to<br>mean more.</strong><i>Discover the collection ↗</i></div><div class="sculpture"><i></i><i></i><i></i></div></div><div class="preview-bottom">Thoughtful design. Lasting impact. <span>01 / 03</span></div></div></div><span class="floating-tag">${icons.check} Responsive by design</span>`;
  if (type === 'intelligence') content = `<div class="browser analytics-browser">${windowBar('MARKET INTELLIGENCE')}<div class="dashboard-body"><div class="dashboard-heading"><span>Opportunity landscape</span><small>DEMO DATA</small></div><div class="chart-legend"><span><i></i>Your audience</span><span><i></i>Market demand</span></div><svg class="line-chart" viewBox="0 0 400 150" fill="none" aria-hidden="true"><path d="M0 30h400M0 70h400M0 110h400" stroke="#ffffff" stroke-opacity=".06"/><path class="draw-path" d="M0 130C35 125 35 65 75 83S135 120 170 67s70 15 100-21 55 5 80-25 40-12 50-20" stroke="#b39ae9" stroke-width="3"/><path d="M0 140c60-10 85-30 130-20s70-53 120-43 90-39 150-43" stroke="#619ca7" stroke-width="2" stroke-dasharray="5 5"/></svg><div class="segment-grid"><div><span>01</span><b>Audience</b><small>Intent & behavior</small></div><div><span>02</span><b>Competition</b><small>Position & opportunity</small></div><div><span>03</span><b>Demand</b><small>Trends & signals</small></div></div></div></div><span class="floating-tag">${icons.search} Clarity before action</span>`;
  if (type === 'search') content = `<div class="browser search-browser">${windowBar('SEARCH VISIBILITY')}<div class="dashboard-body"><div class="search-field">${icons.search}<span>Make your business discoverable</span><span class="search-key">↵</span></div><div class="search-result"><small>YOUR BUSINESS · EXAMPLE.COM</small><strong>Meet your audience where they search.</strong><p>Useful content. A healthy website. A clear path from discovery to action.</p></div><div class="audit-list"><div><span>${icons.check} Technical foundations</span><b>Structured</b></div><div><span>${icons.check} Content architecture</span><b>Connected</b></div><div><span>${icons.check} Customer search intent</span><b>Mapped</b></div></div><div class="keyword-chips"><span>Technical SEO</span><span>Search intent</span><span>Content strategy</span></div></div></div><span class="floating-tag">${icons.globe} Built to be found</span>`;
  if (type === 'acquisition') content = `<div class="browser funnel-browser">${windowBar('CUSTOMER JOURNEY')}<div class="dashboard-body"><div class="dashboard-heading"><span>From interest to intent</span><small>WORKFLOW CONCEPT</small></div><div class="funnel-flow"><div><i>01</i><strong>Discover</strong><span>The right audience</span></div><span class="flow-connector"></span><div><i>02</i><strong>Connect</strong><span>A relevant experience</span></div><span class="flow-connector"></span><div><i>03</i><strong>Convert</strong><span>A meaningful next step</span></div></div><div class="journey-bottom">${icons.target}<span>Qualified relationships.<br><b>Built for lasting value.</b></span><span>↗</span></div></div></div><span class="floating-tag">${icons.target} Authentic connections</span>`;
  if (type === 'ai') content = `<div class="browser ai-browser">${windowBar('AGENTIC MARKETING / CONCEPT')}<div class="dashboard-body"><div class="mini-network"><div class="network-center">${logo}<small>HUMAN GUIDED</small></div><div class="mini-node node-one">${icons.search}<span>Research</span></div><div class="mini-node node-two">${icons.chart}<span>Analyze</span></div><div class="mini-node node-three">${icons.target}<span>Execute</span></div><div class="mini-node node-four">${icons.growth}<span>Optimize</span></div><svg viewBox="0 0 400 240" aria-hidden="true"><path d="M80 55 200 120 320 55M80 190 200 120 320 190" fill="none" stroke="#9172c6" stroke-opacity=".45" stroke-dasharray="4 5"/></svg></div><div class="network-status"><span class="status-dot"></span> Connected workflows <span>Human oversight</span></div></div></div><span class="floating-tag">${icons.network} Intelligence, orchestrated</span>`;
  if (type === 'growth') content = `<div class="browser growth-browser">${windowBar('GROWTH OVERVIEW')}<div class="dashboard-body"><div class="dashboard-heading"><span>The bigger picture</span><small>ILLUSTRATIVE DATA</small></div><div class="growth-metrics"><div><span>Traffic</span><strong>12.8<span>k</span></strong></div><div><span>Qualified leads</span><strong>248</strong></div><div><span>Conversion</span><strong>3.2<span>%</span></strong></div></div><div class="bar-chart">${[22,31,27,40,37,51,46,59,65,62,77,88].map((h,i)=>`<i style="--bar-height:${h}%;--bar-delay:${i*40}ms"></i>`).join('')}</div><div class="chart-axis"><span>JAN</span><span>JUN</span><span>DEC</span></div><div class="growth-footnote">Sample figures explain the interface; they are not client results.</div></div></div><span class="floating-tag">${icons.growth} Progress you can understand</span>`;
  return `<div class="service-visual visual-${type} ${variant}" aria-label="${type === 'growth' || type === 'intelligence' ? 'Illustrative dashboard with sample data' : 'Concept illustration of our service'}"><div class="visual-ambient"></div><div class="visual-grid"></div>${content}</div>`;
}
