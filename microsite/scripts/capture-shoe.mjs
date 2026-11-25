// Captures slide 1's 3D shoe at rest (scan done, sway not started) as a transparent PNG, for trace-outline.py.
// Run against the dev server or a preview:  node scripts/capture-shoe.mjs  then
//   python scripts/trace-outline.py shots/shoe-rest.png > src/sections/shoe-outline.js
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const URL = process.env.URL || 'http://localhost:5173';
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ channel: process.env.CHANNEL || 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL + '/');
await page.addStyleTag({ content: 'html,body{background:transparent!important} main,#site-header,#preloader,.present-hud{visibility:hidden!important}' });
await page.mouse.move(720, 450);
// hero.js: the scan ends at 2.4 s, the sway starts at 2.6 s
await page.waitForFunction(() => { const s = window.deck?.state; return s && s.id === 'top' && s.time > 2.42 && s.time < 2.56; }, null, { timeout: 20000, polling: 'raf' });
await page.locator('#stage').screenshot({ path: 'shots/shoe-rest.png', omitBackground: true });
await browser.close();
console.log('wrote shots/shoe-rest.png');
