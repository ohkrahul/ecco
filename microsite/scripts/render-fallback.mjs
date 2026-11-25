// Renders the 3D shoe (hero pose) to a transparent PNG for the no-WebGL fallback and product shot.
// Re-run after swapping public/models/shoe.glb:  npm run build && npm run preview, then
//   node scripts/render-fallback.mjs  &&  python scripts/crop-fallback.py shots/shoe-render.png public/img/shoe-fallback.webp
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ channel: process.env.CHANNEL || 'msedge' });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.5 });
await page.goto((process.env.URL || 'http://localhost:4173') + '/');
await page.waitForSelector('html.is-ready', { timeout: 15000 });
await page.addStyleTag({ content: 'html,body{background:transparent!important} main,header,footer{visibility:hidden!important}' });
await page.mouse.move(800, 500); // neutral cursor tilt
await page.waitForTimeout(2500);
await page.locator('#stage').screenshot({ path: 'shots/shoe-render.png', omitBackground: true });
await browser.close();
console.log('wrote shots/shoe-render.png');
