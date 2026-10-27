import { icons, logo, heroArt, serviceVisual } from './visuals.js';
import { services, stages, agents, projects } from './data.js';
import { initMotion } from './motion.js?v=hero-flow-2';
import { experienceSection, bindExperience } from './experience.js';
import { referenceHero, unlockSection, journalSection, renderStudio, bindStudio } from './studio.js?v=hero-flow-2';

const app = document.querySelector('#app');
let cleanupMotion = () => {};
let pageAbort;
const arrow = icons.arrow;
const diagonal = icons.diagonal;
const button = (label, href = '/contact', kind = 'primary') => `<a class="button button-${kind}" href="${href}"><span>${label}</span>${arrow}</a>`;
const eyebrow = (text, extra = '') => `<div class="eyebrow"><span class="eyebrow-line"></span>${text}${extra}</div>`;
const sectionTop = (number, name, right = '') => `<div class="section-top"><span><i>${number}</i> ${name}</span><span>${right}</span></div>`;

function header(path) {
  const current = href => path === href || (href !== '/contact' && path.startsWith(href + '/'));
  const links = [['/work','Selected work'],['/solutions','Solutions'],['/engagements','Engagements'],['/insights','Insights'],['/about','About us']];
  const navLink = ([href,label], mobile=false) => `<a class="${mobile?'':'nav-link '}${current(href)?'active':''}" href="${href}" ${current(href)?'aria-current="page"':''}>${label}${mobile?' '+diagonal:''}</a>`;
  return `<header class="site-header"><div class="reading-progress" aria-hidden="true"><i></i></div><div class="nav-container"><a class="brand" href="/" aria-label="Aventrixx home">${logo}<span>AVENTRIXX<span class="brand-period">.</span></span></a><nav class="desktop-nav" aria-label="Main navigation"><div class="nav-dropdown"><button class="nav-link dropdown-toggle ${path.startsWith('/services') ? 'active' : ''}" aria-expanded="false" aria-controls="capability-menu">Capabilities <span class="chevron">⌄</span></button><div id="capability-menu" class="dropdown-menu" hidden><span class="menu-label">AN INTELLIGENT GROWTH SYSTEM</span>${services.map(s => `<a href="/services/${s.slug}">${icons[s.icon]}<span>${s.name}<small>${s.short}</small></span>${diagonal}</a>`).join('')}<a class="menu-all" href="/services">Explore all capabilities ${arrow}</a></div></div>${links.map(link=>navLink(link)).join('')}</nav><a class="nav-contact" href="/contact">Let’s talk ${diagonal}</a><button class="mobile-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span></button></div><nav id="mobile-menu" class="mobile-menu" aria-label="Mobile navigation" hidden>${[['/services','Capabilities'],...links,['/contact','Let’s talk']].map(link=>navLink(link,true)).join('')}<span>DIGITAL EXPERIENCES. INTELLIGENT GROWTH.</span></nav></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-main"><div class="footer-brand"><a class="brand" href="/">${logo}<span>AVENTRIXX<span class="brand-period">.</span></span></a><p>Beyond presence.<br>Into possibility.</p><span class="footer-descriptor">A CREATIVE TECHNOLOGY & GROWTH STUDIO</span></div><div class="footer-column"><h2>CAPABILITIES</h2>${services.map(s => `<a href="/services/${s.slug}">${s.name}</a>`).join('')}</div><div class="footer-column"><h2>EXPLORE</h2><a href="/work">Selected work</a><a href="/#approach">Our approach</a><a href="/solutions">Business solutions</a><a href="/engagements">Engagements</a><a href="/insights">Studio insights</a><a href="/about">About Aventrixx</a><a href="/contact">Get in touch</a></div><div class="footer-connect"><h2>YOUR NEXT CHAPTER</h2><p>Have something<br>ambitious in mind?</p><a href="/contact">Let’s make it happen ${diagonal}</a><span><span class="status-dot"></span> Open to new conversations</span></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Aventrixx. All rights reserved.</span><span><a href="/privacy">Privacy policy</a><a href="/terms">Terms of use</a><button class="back-top">Back to top ↑</button></span></div></div></footer>`;
}

function cta() {
  return `<section class="cta-section container reveal"><div class="cta-glow"></div>${eyebrow('THE NEXT CHAPTER IS YOURS')}<h2>Let’s build what<br>comes <span class="text-gradient">next.</span></h2><div class="cta-bottom"><p>A clearer direction. A stronger presence.<br>A more intelligent way to grow.</p>${button('Build My Growth Strategy')}</div><span class="cta-coordinate">AV / NEXT</span></section>`;
}

function capabilityCards() {
  return services.map((s,i) => `<a class="service-card reveal" href="/services/${s.slug}" style="--reveal-delay:${i%3*70}ms"><div class="service-card-top"><span class="service-icon">${icons[s.icon]}</span><span class="card-number">0${i+1}</span></div><h3>${s.name}</h3><p>${s.short}</p><div class="card-bottom"><span>Explore capability</span>${diagonal}</div></a>`).join('');
}

function showcase() {
  return `<section id="capabilities" class="showcase-section"><div class="showcase-sticky"><div class="container">${sectionTop('01','CONNECTED CAPABILITIES','SIX CAPABILITIES. ONE DIRECTION.')}<div class="section-heading showcase-heading"><div>${eyebrow('THE POWER OF CONNECTION')}<h2>Everything you need.<br><span class="muted">Working together.</span></h2></div><p>Great things happen when the right<br>capabilities connect. Discover yours.</p></div></div><div class="showcase-viewport" tabindex="0" role="region" aria-label="Our six capabilities. Use the previous and next buttons or arrow keys to explore."><div class="showcase-track">${services.map((s,i) => `<article class="showcase-card" data-capability="${s.type}" style="--capability-hue:${[272,216,193,306,267,175][i]}"><div class="showcase-card-header"><span>0${i+1} / 06</span><span>${icons[s.icon]}</span></div>${serviceVisual(s.type,'showcase-visual')}<div class="showcase-card-content"><h3>${s.name}</h3><p>${s.short}</p><a class="text-link" href="/services/${s.slug}">Explore capability ${diagonal}</a></div></article>`).join('')}</div></div><div class="container showcase-controls"><span class="showcase-hint">SCROLL TO EXPLORE <span>⟶</span></span><div class="showcase-progress" aria-hidden="true"><i></i></div><div class="showcase-buttons"><button class="showcase-prev icon-button" aria-label="Previous capability">${arrow}</button><button class="showcase-next icon-button" aria-label="Next capability">${arrow}</button></div></div></div></section>`;
}

function process() {
  return `<section id="approach" class="process-section container">${sectionTop('02','A PURPOSEFUL PROCESS','FROM FIRST CONVERSATION TO WHAT’S NEXT.')}<div class="section-heading reveal"><div>${eyebrow('AMBITION, WITH A PLAN')}<h2>Growth doesn’t happen<br><span class="muted">by accident.</span></h2></div><p>We connect understanding with action.<br>Every stage builds on the last.</p></div><div class="process-layout reveal"><div class="process-tabs" role="tablist" aria-label="Our seven-stage growth process" aria-orientation="vertical">${stages.map((s,i)=>`<button id="stage-tab-${i}" class="process-tab ${i===0?'selected':''}" role="tab" aria-selected="${i===0}" aria-controls="stage-panel" tabindex="${i===0?0:-1}" data-stage="${i}"><span class="stage-number">0${i+1}</span><span>${s.name}</span>${arrow}</button>`).join('')}</div><div id="stage-panel" class="process-panel" role="tabpanel" aria-labelledby="stage-tab-0" tabindex="0">${processPanel(0)}</div></div></section>`;
}
function processPanel(index) {
  const s=stages[index];
  return `<div class="process-panel-top"><span>THE AVENTRIXX METHOD</span><span>0${index+1} / 07</span></div><div class="process-orbit" aria-hidden="true"><div></div><div></div><div></div><span>${String(index+1).padStart(2,'0')}</span></div><div class="process-panel-copy"><h3>${s.title}</h3><p>${s.text}</p><div class="deliverable-chips">${s.items.map(x=>`<span>${icons.check}${x}</span>`).join('')}</div></div>`;
}

function aiSection() {
  return `<section class="ai-section"><div class="container">${sectionTop('03','INTELLIGENCE, ORCHESTRATED','HUMAN VISION. CONNECTED WORKFLOWS.')}<div class="ai-layout"><div class="ai-copy reveal">${eyebrow('INTELLIGENCE WITH INTENTION')}<h2>More than tools.<br><span class="text-gradient">A connected mind.</span></h2><p>Research becomes insight. Insight becomes action. We design AI-assisted workflows that connect the work, with your people in control.</p><a class="text-link" href="/services/agentic-ai-marketing">Discover agentic AI marketing ${diagonal}</a><div class="ai-note">${icons.network}<span>WORKFLOW DEMONSTRATION<br><small>Illustrative architecture. Human oversight at every stage.</small></span></div></div><div class="agent-interactive reveal"><div class="agent-diagram"><svg class="agent-connections" viewBox="0 0 580 410" aria-hidden="true"><defs><radialGradient id="networkGlow"><stop stop-color="#b18be9" stop-opacity=".24"/><stop offset="1" stop-color="#b18be9" stop-opacity="0"/></radialGradient></defs><circle cx="290" cy="205" r="180" fill="url(#networkGlow)"/><circle cx="290" cy="205" r="146" fill="none" stroke="#9d7fc6" stroke-opacity=".15" stroke-dasharray="3 7"/><path class="network-lines" d="M100 110 290 205 480 110M100 300 290 205 480 300M290 45v320" fill="none" stroke="#9570c8" stroke-opacity=".5"/></svg><div class="agent-core">${logo}<span>AVENTRIXX</span><small>HUMAN GUIDED</small></div>${agents.map((a,i)=>`<button class="agent-node agent-node-${i} ${i===0?'selected':''}" data-agent="${i}" aria-pressed="${i===0}" aria-controls="agent-description">${icons[a.icon]}<span>${a.name}</span><i></i></button>`).join('')}</div><div id="agent-description" class="agent-description" aria-live="polite">${agentDescription(0)}</div><span class="agent-instruction">SELECT A NODE TO EXPLORE THE WORKFLOW</span></div></div></div></section>`;
}
function agentDescription(index) {
  const a=agents[index];
  return `<div><span class="tiny-dot violet"></span><strong>0${index+1} · ${a.name}</strong><span>WORKFLOW CONCEPT</span></div><p>${a.text}</p><small>${a.output}</small>`;
}

function projectCards() {
  return projects.map((p,i)=>`<a class="project-card reveal" href="/work/${p.slug}" style="--reveal-delay:${i*70}ms"><div class="project-visual project-${p.slug}"><span class="concept-label">CONCEPT PROJECT</span>${serviceVisual(p.type,'portfolio-visual')}<div class="project-overlay"><span>${p.name}</span>${diagonal}</div></div><div class="project-info"><h3>${p.name}</h3><span>${p.category}</span>${diagonal}</div></a>`).join('');
}

function home() {
  return `<main id="main">${referenceHero()}${unlockSection()}${showcase()}${experienceSection()}${process()}${aiSection()}<section class="work-section container">${sectionTop('04','POSSIBILITY, MADE VISIBLE','A GLIMPSE OF WHAT WE CAN CREATE.')}<div class="section-heading reveal"><div>${eyebrow('SELECTED EXPLORATIONS')}<h2>Ideas with intention.<br><span class="muted">Experiences with impact.</span></h2></div><a class="text-link" href="/work">Explore selected work ${diagonal}</a></div><div class="project-grid">${projectCards()}</div><p class="concept-note">An exploration of our approach. These are concept projects, not commissioned client work.</p></section><section class="principles-section container reveal"><div>${eyebrow('THE WAY WE THINK')}<h2>Purpose over noise.<br><span class="muted">Progress over promises.</span></h2></div><div class="principles-list"><div><span>01</span><h3>Clarity comes first.</h3><p>Understand the business before choosing the tools.</p></div><div><span>02</span><h3>Everything connects.</h3><p>Design, data, and marketing move in one direction.</p></div><div><span>03</span><h3>People stay at the center.</h3><p>Technology supports judgment. It never replaces trust.</p></div></div></section>${journalSection()}${cta()}</main>`;
}

function servicesPage() {
  return `<main id="main"><section class="page-hero container">${eyebrow('CONNECTED CAPABILITIES')}<h1>Six perspectives.<br><span class="text-gradient">One growth system.</span></h1><p>Strategy, design, intelligence, and technology.<br>The right combination for your next chapter.</p></section><section class="container services-grid">${capabilityCards()}</section><section class="services-story container reveal"><h2>Start with your ambition.<br><span class="muted">We’ll find the right combination.</span></h2><p>You don’t need to choose every service. We begin with your business and build a focused roadmap around what will be most useful.</p>${button('Build My Growth Strategy')}</section>${aiSection()}${cta()}</main>`;
}
function servicePage(service) {
  const related=services.filter(s=>s.slug!==service.slug).slice(0,3);
  return `<main id="main"><section class="service-hero container"><div><a class="breadcrumb" href="/services">← ALL CAPABILITIES</a>${eyebrow(service.name.toUpperCase())}<h1>${service.title}</h1><p>${service.description}</p>${button('Build My Growth Strategy',`/contact?service=${service.slug}`)}</div>${serviceVisual(service.type,'detail-visual')}</section><section class="service-details container"><div class="reveal">${eyebrow('PURPOSE BEFORE PROCESS')}<h2>${service.short}</h2><p>${service.detail}</p></div><div class="deliverables-panel reveal"><h3>What we can help you build</h3>${service.deliverables.map((d,i)=>`<div><span>0${i+1}</span><p>${d}</p>${icons.check}</div>`).join('')}<small>Deliverables and scope are agreed for each engagement.</small></div></section>${service.type==='ai'?aiSection():''}${service.type==='growth'?`<section class="container data-disclaimer">${icons.chart}<p>The dashboard above uses illustrative data to demonstrate a possible reporting interface. These figures are not client outcomes, forecasts, or guarantees.</p></section>`:''}<section class="container related-section">${eyebrow('BETTER, TOGETHER')}<h2>Connect your next capability.</h2><div class="related-grid">${related.map(s=>`<a class="service-card" href="/services/${s.slug}"><span class="service-icon">${icons[s.icon]}</span><h3>${s.name}</h3><p>${s.short}</p><div class="card-bottom"><span>Explore capability</span>${diagonal}</div></a>`).join('')}</div></section>${cta()}</main>`;
}
function workPage() {
  return `<main id="main"><section class="page-hero container">${eyebrow('SELECTED EXPLORATIONS')}<h1>Possibility,<br><span class="text-gradient">made visible.</span></h1><p>A collection of concept experiences that explore<br>how thoughtful design and intelligent technology connect.</p></section><section class="container work-list"><div class="project-grid">${projectCards()}</div><p class="concept-note">All projects on this page are self-initiated concepts. No client relationships or business results are implied.</p></section>${cta()}</main>`;
}
function projectPage(project) {
  return `<main id="main"><section class="page-hero container"><a class="breadcrumb" href="/work">← ALL EXPLORATIONS</a>${eyebrow(`${project.category} / CONCEPT PROJECT`)}<h1>${project.name}<span class="text-gradient">.</span></h1><p>${project.title}</p></section><section class="container case-visual project-${project.slug}">${serviceVisual(project.type,'case-study-visual')}<span class="concept-label">SELF-INITIATED CONCEPT · DEMONSTRATION ONLY</span></section><section class="case-details container"><div>${eyebrow('THE EXPLORATION')}<h2>A considered approach.</h2><div class="deliverable-chips">${project.tags.map(t=>`<span>${t}</span>`).join('')}</div></div><div><h3>The design challenge</h3><p>${project.challenge}</p><h3>The approach</h3><p>${project.approach}</p><h3>About this concept</h3><p>This is an illustrative design exploration. It is not commissioned client work, and no performance outcomes are claimed.</p></div></section><div class="container case-navigation"><a class="text-link" href="/work">← Back to selected work</a><a class="text-link" href="/work/${projects[(projects.indexOf(project)+1)%projects.length].slug}">Next exploration ${arrow}</a></div>${cta()}</main>`;
}
function aboutPage() {
  return `<main id="main"><section class="page-hero container">${eyebrow('ABOUT AVENTRIXX')}<h1>Different disciplines.<br><span class="text-gradient">Shared ambition.</span></h1><p>A creative technology and growth studio connecting<br>digital experiences, market intelligence, and purposeful AI.</p></section><section class="about-manifesto container reveal"><span class="about-symbol" aria-hidden="true">✳</span><div><h2>We see the bigger picture.<br><span class="muted">Then we build the connections.</span></h2><p>Too often, businesses get a website without a strategy, marketing without insight, or technology without purpose. Aventrixx brings those pieces together.</p><p>Our approach starts with your business. We listen, investigate, and build a clear direction before choosing the tools. Every design decision and every workflow should make your business easier to discover, understand, and connect with.</p><p>We believe in honest expectations, useful technology, and progress you can understand. AI supports the work. Human judgment guides it.</p></div></section>${process()}${cta()}</main>`;
}

function contactPage() {
  const selected = new URLSearchParams(location.search).get('service');
  return `<main id="main"><section class="contact-section container"><div class="contact-copy">${eyebrow('LET’S START A CONVERSATION')}<h1>Your ambition.<br><span class="text-gradient">Our next chapter.</span></h1><p>Tell us a little about your business and what you have in mind. We’ll start with a conversation about where you want to go.</p><div class="contact-expectations"><h2>WHAT HAPPENS NEXT</h2><div><span>01</span><p>We review your business and your inquiry.</p></div><div><span>02</span><p>We contact you to arrange a discovery conversation.</p></div><div><span>03</span><p>Together, we define a practical next step.</p></div></div><span class="contact-status"><span class="status-dot"></span> A thoughtful conversation. No pressure.</span></div><form id="inquiry-form" class="inquiry-form"><span class="form-label">BUILD MY GROWTH STRATEGY</span><h2>Let’s get to know you.</h2><div class="form-row"><label>Your name <span>*</span><input name="name" autocomplete="name" placeholder="Alex Morgan" required minlength="2" maxlength="100"></label><label>Work email <span>*</span><input name="email" autocomplete="email" type="email" placeholder="alex@yourcompany.com" required maxlength="254"></label></div><label>Company / website<input name="company" autocomplete="organization" placeholder="Your business name or website" maxlength="200"></label><label>What are you interested in? <span>*</span><select name="service" required><option value="Growth strategy">An integrated growth strategy</option>${services.map(s=>`<option value="${s.name}" ${s.slug===selected?'selected':''}>${s.name}</option>`).join('')}<option value="Not sure yet">I’d like some guidance</option></select></label><label>Tell us about your ambition <span>*</span><textarea name="message" rows="5" placeholder="What does your business do? What would you like to achieve?" required minlength="20" maxlength="5000"></textarea><small>A little context helps us prepare. At least 20 characters.</small></label><div class="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website_check" tabindex="-1" autocomplete="off"></label></div><label class="consent-label"><input type="checkbox" name="consent" required><span>I agree to Aventrixx storing my information and contacting me about this inquiry. Read the <a href="/privacy">privacy policy</a>.</span></label><button class="button button-primary form-submit" type="submit"><span>Send My Inquiry</span>${arrow}</button><div id="form-status" class="form-status" role="status" aria-live="polite"></div><span class="form-footnote">Your information is used to handle your inquiry. We won’t add you to a mailing list.</span></form></section></main>`;
}

function legalPage(type) {
  const privacy=type==='privacy';
  return `<main id="main"><section class="page-hero container">${eyebrow('AVENTRIXX / LEGAL')}<h1>${privacy?'Privacy policy':'Terms of use'}<span class="text-gradient">.</span></h1><p>Last updated: October 21, 2026</p></section><article class="legal-copy container">${privacy?`<h2>Information you share</h2><p>When you submit an inquiry, we collect your name, email address, company or website if provided, service interest, message, and your consent. Please avoid submitting sensitive personal information.</p><h2>How it is used</h2><p>Your information is used to review your inquiry, respond to you, and discuss a potential engagement. It is not used to subscribe you to marketing emails or sold to third parties.</p><h2>Storage and security</h2><p>Inquiries are stored on the server hosting this website. Network address information is temporarily held in memory for rate limiting and spam protection and is not included in the inquiry record. Server operators may maintain technical access logs. Access to inquiry records should be restricted to authorized personnel.</p><h2>Retention</h2><p>Inquiry records are retained for up to 12 months and then deleted automatically when the server runs. If an engagement follows, any additional processing and retention terms will be agreed separately.</p><h2>Cookies and analytics</h2><p>This site does not set advertising cookies or include third-party analytics. Essential browser storage may be used to preserve navigation behavior. The visual dashboards use illustrative data.</p><h2>Your choices</h2><p>You may request access, correction, or deletion of your inquiry data through the <a href="/contact">contact form</a>. Include enough information for us to identify your inquiry without submitting sensitive documents.</p>`:`<h2>Using this website</h2><p>This website introduces Aventrixx’s approach and capabilities. Service descriptions are general information. Scope, availability, deliverables, pricing, and obligations are established in a separate written engagement agreement.</p><h2>Concepts and demonstration data</h2><p>Portfolio concepts and interface demonstrations are clearly labeled. They do not represent commissioned client work, actual client metrics, guaranteed outcomes, or a live autonomous AI system.</p><h2>No performance guarantees</h2><p>Marketing, search visibility, and business outcomes depend on many factors outside any studio’s control. Nothing on this website guarantees rankings, revenue, leads, or specific business results.</p><h2>Intellectual property</h2><p>The Aventrixx identity, original website design, and concept materials may not be reproduced for commercial use without authorization. Any third-party rights remain with their respective owners.</p><h2>Inquiries</h2><p>Submitting an inquiry does not create a service agreement or guarantee availability. We use your submitted details to review and respond to your request, in accordance with our <a href="/privacy">privacy policy</a>.</p><h2>Contact</h2><p>For questions about these terms, use the <a href="/contact">contact form</a>.</p>`}</article></main>`;
}
function notFound() {
  return `<main id="main"><section class="page-hero container error-page">${eyebrow('404 / A DIFFERENT DIRECTION')}<h1>A little off course.<br><span class="text-gradient">Let’s reconnect.</span></h1><p>The page you’re looking for isn’t here.</p>${button('Back to Aventrixx','/')}</section></main>`;
}

function render({scroll=true}={}) {
  cleanupMotion();
  pageAbort?.abort();
  pageAbort=new AbortController();
  document.body.classList.remove('menu-open');
  const path=location.pathname.replace(/\/$/,'')||'/';
  let content, title;
  const studio=renderStudio(path);
  if(studio){content=studio.html;title=studio.title;}
  else if(path==='/'){content=home();title='Beyond presence. Into possibility.';}
  else if(path==='/services'){content=servicesPage();title='Our Capabilities';}
  else if(path.startsWith('/services/')){const s=services.find(s=>`/services/${s.slug}`===path);content=s?servicePage(s):notFound();title=s?s.name:'Page not found';}
  else if(path==='/work'){content=workPage();title='Selected Explorations';}
  else if(path.startsWith('/work/')){const p=projects.find(p=>`/work/${p.slug}`===path);content=p?projectPage(p):notFound();title=p?p.name:'Page not found';}
  else if(path==='/about'){content=aboutPage();title='About Us';}
  else if(path==='/contact'){content=contactPage();title='Build My Growth Strategy';}
  else if(path==='/privacy'||path==='/terms'){content=legalPage(path.slice(1));title=path==='/privacy'?'Privacy Policy':'Terms of Use';}
  else {content=notFound();title='Page not found';}
  document.title=`Aventrixx — ${title}`;
  app.innerHTML=header(path)+content+footer();
  bindPage();
  if(scroll)window.scrollTo({top:0,behavior:'instant'});
  cleanupMotion=initMotion();
  if(location.hash)requestAnimationFrame(()=>hashTarget(location.hash)?.scrollIntoView({behavior:'instant'}));
}

function hashTarget(hash) {
  try{return document.getElementById(decodeURIComponent(hash.slice(1)));}catch{return null;}
}

function bindPage() {
  const signal=pageAbort.signal;
  bindExperience(signal);
  bindStudio(signal);
  const on=(el,event,handler)=>el?.addEventListener(event,handler,{signal});
  const toggle=document.querySelector('.dropdown-toggle'), menu=document.querySelector('.dropdown-menu');
  const setDropdown=(open)=>{toggle.setAttribute('aria-expanded',String(open));menu.hidden=!open;};
  on(toggle,'click',()=>setDropdown(menu.hidden));
  on(document,'click',e=>{if(!e.target.closest('.nav-dropdown'))setDropdown(false);});
  on(document.querySelector('.nav-dropdown'),'focusout',e=>{if(!e.currentTarget.contains(e.relatedTarget))setDropdown(false);});
  const mobileToggle=document.querySelector('.mobile-toggle'), mobile=document.querySelector('.mobile-menu');
  const setMobile=(open)=>{mobile.hidden=!open;mobileToggle.setAttribute('aria-expanded',String(open));mobileToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');document.body.classList.toggle('menu-open',open);if(open)mobile.querySelector('a').focus();};
  on(mobileToggle,'click',()=>setMobile(mobile.hidden));
  on(document,'keydown',e=>{
    if(e.key==='Escape'){if(!menu.hidden){setDropdown(false);toggle.focus();}if(!mobile.hidden){setMobile(false);mobileToggle.focus();}}
    if(e.key==='Tab'&&!mobile.hidden){const els=[mobileToggle,...mobile.querySelectorAll('a')];const current=els.indexOf(document.activeElement);if(e.shiftKey&&current===0){e.preventDefault();els.at(-1).focus();}else if(!e.shiftKey&&current===els.length-1){e.preventDefault();mobileToggle.focus();}}
  });
  const processTabs=[...document.querySelectorAll('.process-tab')];
  function selectStage(index,focus=false){processTabs.forEach((t,i)=>{t.classList.toggle('selected',i===index);t.setAttribute('aria-selected',String(i===index));t.tabIndex=i===index?0:-1;});const panel=document.querySelector('#stage-panel');panel.innerHTML=processPanel(index);panel.setAttribute('aria-labelledby',`stage-tab-${index}`);if(focus)processTabs[index].focus();}
  processTabs.forEach((tab,index)=>{on(tab,'click',()=>selectStage(index));on(tab,'keydown',e=>{let next=index;if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(index+1)%stages.length;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(index+stages.length-1)%stages.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=stages.length-1;else return;e.preventDefault();selectStage(next,true);});});
  document.querySelectorAll('.agent-node').forEach(node=>on(node,'click',()=>{const index=Number(node.dataset.agent);document.querySelectorAll('.agent-node').forEach(n=>{const selected=n===node;n.classList.toggle('selected',selected);n.setAttribute('aria-pressed',String(selected));});document.querySelector('#agent-description').innerHTML=agentDescription(index);}));
  on(document.querySelector('.back-top'),'click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  on(document.querySelector('#inquiry-form'),'submit',submitInquiry);
}

async function submitInquiry(event) {
  event.preventDefault();
  const form=event.currentTarget;
  if(!form.reportValidity())return;
  const status=form.querySelector('#form-status'),submit=form.querySelector('.form-submit');
  const data=Object.fromEntries(new FormData(form));data.consent=form.elements.consent.checked;
  status.className='form-status';status.textContent='Sending your inquiry…';submit.disabled=true;submit.querySelector('span').textContent='Sending…';
  try {
    const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||'Your inquiry could not be saved. Please try again.');
    status.classList.add('success');status.textContent=`Your inquiry has been received. Reference: ${result.reference}. We’ll use your email to discuss a discovery conversation.`;form.reset();submit.querySelector('span').textContent='Send Another Inquiry';
  } catch(error) {
    status.classList.add('error');status.textContent=error.name==='TimeoutError'?'The request timed out and delivery is uncertain. Please try again if needed.':error.message==='Failed to fetch'?'We couldn’t reach the server. Your inquiry has not been confirmed; please try again.':error.message;submit.querySelector('span').textContent='Try Again';
  } finally {submit.disabled=false;}
}

document.addEventListener('click',event=>{
  const link=event.target.closest('a');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target||link.hasAttribute('download'))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin)return;
  event.preventDefault();
  const samePage=url.pathname===location.pathname&&url.search===location.search;
  if(samePage&&url.hash){history.pushState({},'',url);hashTarget(url.hash)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});document.querySelector('.mobile-menu').hidden=true;document.querySelector('.mobile-toggle').setAttribute('aria-expanded','false');document.querySelector('.mobile-toggle').setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open');return;}
  history.pushState({},'',url);render();
  const main=document.querySelector('#main');main.setAttribute('tabindex','-1');main.focus({preventScroll:true});
});
history.scrollRestoration='auto';
window.addEventListener('popstate',()=>render({scroll:false}));
render({scroll:false});
