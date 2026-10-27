import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, readdir, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from '../server.js';
import { services, projects } from '../src/data.js';
import { studioRoutes } from '../src/studio.js';

// Install Playwright separately, or provide PLAYWRIGHT_PATH to an existing package.
const require=createRequire(import.meta.url);
const { chromium }=require(process.env.PLAYWRIGHT_PATH||'playwright');
const dataDir=await mkdtemp(join(tmpdir(),'aventrixx-browser-'));
const server=createServer({dataDir});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:960}});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const routes=[...studioRoutes,'/','/services','/work','/about','/contact','/privacy','/terms',...services.map(s=>`/services/${s.slug}`),...projects.map(p=>`/work/${p.slug}`)];
const instantScroll=async selector=>{await page.locator(selector).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));await page.waitForTimeout(150);};

try {
  for(const width of [360,390,768,1024,1440]){
    await page.setViewportSize({width,height:960});
    for(const route of routes){
      const response=await page.goto(base+route);assert.equal(response.status(),200,route);
      await page.locator('#main h1').waitFor();await page.evaluate(()=>document.fonts.ready);
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
      assert.equal(overflow,false,`Horizontal overflow at ${width}px: ${route}`);
    }
    console.log(`PASS: ${routes.length} pages at ${width}px`);
  }
  await page.setViewportSize({width:1440,height:960});await page.goto(base);
  await page.locator('.pixels-ready').waitFor();
  const pixels=()=>page.locator('.pixel-canvas').evaluate(el=>el.toDataURL());
  const movingPixels=await pixels();await page.waitForTimeout(200);
  assert.notEqual(await pixels(),movingPixels,'Pixel landscape animates while visible');
  const firstFlow=await pixels();await page.waitForTimeout(1200);
  const secondFlow=await pixels();assert.notEqual(secondFlow,firstFlow,'Pixel shapes evolve without pointer input');
  await page.waitForTimeout(1200);assert.notEqual(await pixels(),secondFlow,'Hero motion continues beyond its entrance');
  await instantScroll('#unlock');
  await page.locator('#unlock-tab-2').click();
  assert.equal(await page.locator('#unlock-tab-2').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('#unlock-panel-2').isVisible(),true);
  assert.equal(await page.locator('#unlock-panel-0').isVisible(),false);
  await page.locator('#unlock-tab-0').focus();await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('#unlock-tab-1').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('#unlock-tab-1').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('End');assert.equal(await page.locator('#unlock-tab-3').getAttribute('aria-selected'),'true');
  await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#unlock-tab-0').getAttribute('aria-selected'),'true');
  await page.keyboard.press('End');await page.keyboard.press('Home');
  assert.equal(await page.locator('#unlock-tab-0').getAttribute('tabindex'),'0');
  assert.equal(await page.locator('.unlock-tab[tabindex="0"]').count(),1);
  console.log('PASS: numbered showcase pointer and keyboard controls');

  for(const route of ['/solutions','/engagements']){
    await page.goto(base+route);
    assert.equal(await page.locator(`.desktop-nav a[href="${route}"]`).getAttribute('aria-current'),'page');
    const question=page.locator('.faq-list summary').first();
    await question.focus();await page.keyboard.press('Enter');
    assert.equal(await question.evaluate(el=>el.parentElement.open),true);
    await page.keyboard.press('Enter');assert.equal(await question.evaluate(el=>el.parentElement.open),false);
  }
  await page.goto(base+'/insights/beyond-the-website');
  assert.equal(await page.locator('.desktop-nav a[href="/insights"]').getAttribute('aria-current'),'page');
  await page.locator('.article-toc a').last().click();
  assert.equal(new URL(page.url()).hash,'#article-section-3');
  await page.waitForTimeout(800);
  const articleHeading=await page.locator('#article-section-3 h2').boundingBox();
  assert.ok(articleHeading.y>=72&&articleHeading.y<960,'Article heading clears the fixed navigation');
  await page.goBack();assert.equal(new URL(page.url()).hash,'');
  console.log('PASS: FAQs, article anchors, history, and active navigation');
  await page.goto(base);
  await instantScroll('#experience');
  const pausedPixels=await pixels();await page.waitForTimeout(200);
  assert.equal(await pixels(),pausedPixels,'Offscreen pixel landscape pauses');
  await page.locator('.comparison-range').focus();await page.keyboard.press('Home');
  assert.equal(await page.locator('.comparison-range').inputValue(),'0');
  assert.equal(await page.locator('.design-comparison').evaluate(el=>el.style.getPropertyValue('--comparison')),'0%');
  await page.keyboard.press('End');assert.equal(await page.locator('.comparison-range').inputValue(),'100');
  assert.equal(await page.locator('.design-comparison').evaluate(el=>el.style.getPropertyValue('--comparison')),'100%');
  const slider=await page.locator('.comparison-range').boundingBox();
  await page.mouse.click(slider.x+slider.width*.35,slider.y+slider.height*.5);
  const value=Number(await page.locator('.comparison-range').inputValue());assert.ok(value>20&&value<50,'Pointer slider');
  await page.locator('#experience-tab-0').focus();await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('#experience-panel').getAttribute('aria-labelledby'),'experience-tab-1');
  assert.match(await page.locator('#experience-panel').innerText(),/DEMO DATA/);
  await page.keyboard.press('End');assert.equal(await page.locator('#experience-panel').getAttribute('aria-labelledby'),'experience-tab-2');
  await page.locator('#experience-tab-0').click();assert.equal(await page.locator('.comparison-range').inputValue(),'68');
  console.log('PASS: comparison pointer/keyboard and all experience scenes');

  await instantScroll('#capabilities');
  assert.equal(await page.locator('#capabilities').evaluate(el=>el.classList.contains('is-pinned')),true);
  await page.locator('#capabilities').evaluate(el=>{const sticky=el.querySelector('.showcase-sticky');const distance=el.offsetHeight-sticky.offsetHeight;scrollTo({top:scrollY+el.getBoundingClientRect().top-parseFloat(getComputedStyle(sticky).top)+distance,behavior:'instant'});});
  await page.waitForTimeout(200);
  assert.equal(await page.locator('.showcase-next').isDisabled(),true);
  const lastPanel=await page.locator('.showcase-card').last().boundingBox();assert.ok(lastPanel.x>=-1&&lastPanel.x+lastPanel.width<=1441,'Final capability visible');
  const controls=await page.locator('.showcase-controls').boundingBox();assert.ok(controls.y+controls.height<=961,'Pinned controls fit');
  await page.locator('.showcase-prev').click();await page.waitForTimeout(750);assert.equal(await page.locator('.showcase-next').isDisabled(),false);
  console.log('PASS: pinned showcase reaches final panel and controls fit');

  await instantScroll('#approach');await page.locator('#stage-tab-0').focus();await page.keyboard.press('End');
  assert.equal(await page.locator('#stage-panel').getAttribute('aria-labelledby'),'stage-tab-6');
  await page.locator('.agent-node-3').click();assert.match(await page.locator('#agent-description').innerText(),/approved tasks/i);
  await page.goto(base);await page.locator('.dropdown-toggle').click();assert.equal(await page.locator('.dropdown-menu').isVisible(),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('.dropdown-menu').isVisible(),false);
  await page.locator('.nav-contact').click();assert.equal(new URL(page.url()).pathname,'/contact');await page.goBack();assert.equal(new URL(page.url()).pathname,'/');
  await page.goto(base+'/services/market-intelligence');await page.reload();assert.match(await page.locator('h1').innerText(),/Less guesswork/);
  console.log('PASS: process, agents, navigation, history, and direct refresh');

  await page.setViewportSize({width:390,height:844});await page.goto(base);await page.locator('.mobile-toggle').click();
  assert.equal(await page.locator('.mobile-menu').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('.mobile-menu').isVisible(),false);
  await instantScroll('#capabilities');assert.equal(await page.locator('#capabilities').evaluate(el=>el.classList.contains('is-pinned')),false);
  await page.locator('.showcase-next').click();await page.waitForTimeout(700);assert.ok(await page.locator('.showcase-viewport').evaluate(el=>el.scrollLeft)>200);
  await page.setViewportSize({width:1440,height:600});await page.goto(base);assert.equal(await page.locator('#capabilities').evaluate(el=>el.classList.contains('is-pinned')),false);
  console.log('PASS: mobile navigation/carousel and short-screen fallback');

  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:960});await page.goto(base);
  assert.equal(await page.locator('#capabilities').evaluate(el=>el.classList.contains('is-pinned')),false);
  assert.equal(await page.locator('.signal-hero').count(),1);
  await page.locator('.pixels-ready').waitFor();
  const staticPixels=await pixels();await page.waitForTimeout(200);
  assert.equal(await pixels(),staticPixels,'Reduced motion preserves a static pixel landscape');
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);
  const resumedPixels=await pixels();await page.waitForTimeout(200);
  assert.notEqual(await pixels(),resumedPixels,'Pixel motion resumes when reduced motion is disabled');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
  assert.equal(await page.locator('.experience-frame').evaluate(el=>getComputedStyle(el).transform),'none');
  await instantScroll('#experience');await page.locator('.comparison-range').focus();await page.keyboard.press('End');assert.equal(await page.locator('.comparison-range').inputValue(),'100');
  console.log('PASS: static reduced-motion alternatives remain interactive');

  await page.goto(base+'/contact?service=market-intelligence');assert.equal(await page.locator('select[name=service]').inputValue(),'Market Intelligence');
  await page.locator('input[name=name]').fill('Browser Verification');await page.locator('input[name=email]').fill('browser-test@example.com');
  await page.locator('textarea[name=message]').fill('An automated test of the Aventrixx inquiry workflow.');await page.locator('input[name=consent]').check();
  await page.locator('.form-submit').click();await page.locator('.form-status.success').waitFor();assert.equal((await readdir(dataDir)).length,1);
  await page.route('**/api/inquiries',route=>route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'The inquiry could not be saved.'})}));
  await page.locator('input[name=name]').fill('Browser Verification');await page.locator('input[name=email]').fill('browser-test@example.com');
  await page.locator('textarea[name=message]').fill('An automated test of the failure handling for inquiries.');await page.locator('input[name=consent]').check();
  await page.locator('.form-submit').click();await page.locator('.form-status.error').waitFor();assert.equal(await page.locator('.form-status.success').count(),0);
  assert.equal((await readdir(dataDir)).length,1);
  assert.deepEqual(errors,[],'No uncaught browser errors');
  console.log('PASS: real inquiry storage, failure states, and no browser errors');
  await mkdir('artifacts',{recursive:true});
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base);await page.waitForTimeout(1100);await page.screenshot({path:'artifacts/final-desktop.png'});
  await instantScroll('#experience');await page.waitForTimeout(700);await page.screenshot({path:'artifacts/experience-desktop.png'});
  await page.setViewportSize({width:390,height:844});await page.goto(base);await page.waitForTimeout(1100);await page.screenshot({path:'artifacts/final-mobile.png'});
  console.log('All browser checks passed.');
} finally {
  await browser.close();await new Promise(resolve=>server.close(resolve));await rm(dataDir,{recursive:true,force:true});
}
