// Regression checks for the two display modes (run by `npm run smoke` after smoke.mjs).
// 1. Scroll mode (phone): a slide coming into view, scrolling down or back up, never snaps content that was already
//    on screen back to its start state.
// 2. Deck mode (desktop): resizing the window across the phone/laptop boundary never reloads the page mid-pitch.
import { chromium } from 'playwright-core';

const BASE = process.env.URL || 'http://localhost:4173';
let failures = 0;
const fail = (msg) => { failures++; console.error('FAIL', msg); };
const browser = await chromium.launch({ channel: process.env.CHANNEL || 'msedge' });

async function open(viewport, touch) {
  const page = await browser.newPage({ viewport, hasTouch: touch, isMobile: touch });
  await page.goto(BASE + '/');
  await page.waitForSelector('html.is-ready', { timeout: 15000 });
  return page;
}

/** Revealed elements of #id that are on screen and fully shown right now. */
const shown = (page, id) => page.evaluate((id) => [...document.querySelectorAll(`#${id} [data-reveal], #${id} .phase, #${id} .zone-manifesto`)]
  .map((el, i) => ({ i, b: el.getBoundingClientRect(), o: +getComputedStyle(el).opacity, v: getComputedStyle(el).visibility }))
  .filter((e) => e.b.bottom > 0 && e.b.top < innerHeight && e.o >= 0.9 && e.v !== 'hidden').map((e) => e.i), id);
const opacities = (page, id) => page.evaluate((id) => [...document.querySelectorAll(`#${id} [data-reveal], #${id} .phase, #${id} .zone-manifesto`)]
  .map((el) => (getComputedStyle(el).visibility === 'hidden' ? 0 : +getComputedStyle(el).opacity)), id);

// 1 · phone: scroll into each tall slide from above and from below; what was showing must stay showing.
{
  const page = await open({ width: 390, height: 844 }, true);
  for (const id of ['zone', 'unposted', 'practice-club', 'flow-01']) {
    for (const dir of ['down', 'up']) {
      const { top, height } = await page.evaluate((id) => { const el = document.getElementById(id); return { top: el.offsetTop, height: el.offsetHeight }; }, id);
      // start well away (the slide reverted), then stop with a 20%-of-screen strip of it showing
      const far = dir === 'down' ? top - 3 * 844 : top + height + 3 * 844;
      const near = dir === 'down' ? top - 844 * 0.8 : top + height - 844 * 0.2;
      await page.evaluate((y) => scrollTo(0, y), Math.max(0, far));
      await page.waitForTimeout(600);
      await page.evaluate((y) => scrollTo(0, y), near);
      await page.waitForTimeout(700);
      const before = await shown(page, id);
      await page.evaluate((d) => scrollBy(0, d), dir === 'down' ? 160 : -160);
      await page.waitForTimeout(150);
      const after = await opacities(page, id);
      const dropped = before.filter((i) => after[i] < 0.5);
      if (dropped.length) fail(`phone #${id} scrolling ${dir}: ${dropped.length} element(s) on screen snapped back (opacity ${dropped.map((i) => after[i].toFixed(2)).join(', ')})`);
    }
  }
  await page.close();
}

// 1b · phone: a slide's content is fully shown within 1.6 s of scrolling to it (people scroll on; they don't wait).
{
  const page = await open({ width: 390, height: 844 }, true);
  const parts = { zone: '.zone-core, .zone-manifesto', 'flow-01': '.phase', 'one-pair': '.op-stop, .op-product', 'flow-02': '.phase' };
  for (const [id, sel] of Object.entries(parts)) {
    await page.evaluate((id) => scrollTo(0, document.getElementById(id).offsetTop - innerHeight * 0.5), id);
    await page.waitForTimeout(1600);
    const slow = await page.evaluate(([id, sel]) => [...document.querySelectorAll(`#${id} :is(${sel})`)]
      .map((el) => (getComputedStyle(el).visibility === 'hidden' ? 0 : +getComputedStyle(el).opacity)).filter((o) => o < 0.9).length, [id, sel]);
    if (slow) fail(`phone #${id}: ${slow} part(s) still not shown 1.6 s after scrolling to it`);
  }
  await page.close();
}

// 2 · desktop: resize across the boundary (window snapped to half a 1440 screen) — no reload, still the deck.
{
  const page = await open({ width: 1440, height: 900 }, false);
  await page.evaluate(() => (window.__stillHere = true));
  await page.setViewportSize({ width: 720, height: 900 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({ still: window.__stillHere === true, mode: window.deck?.mode }));
  if (!r.still) fail('desktop: resizing to 720 px wide reloaded the page');
  if (r.mode !== 'deck') fail(`desktop: after resizing, mode is ${r.mode}, expected the deck`);
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} failure(s)` : '\nMODES PASS');
process.exit(failures ? 1 : 0);
