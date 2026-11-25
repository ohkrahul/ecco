// Smoke check: opens the built site in Edge, clicks through every slide and build like a presenter (deck mode,
// desktop widths + an iPad held sideways, swiping), scrolls the whole page on a phone and an upright tablet
// (scroll mode), screenshots to shots/, and fails on JS errors, 404s, external requests, a stuck preloader,
// sideways scrolling, the 3D shoe showing on the wrong slide, or text cut off by the screen edge.
// Usage: npm run build && npm run preview  (in another terminal)  then  npm run smoke
// Env: URL (default http://localhost:4173), WIDTHS="1440,1920", SKIP_PERF=1
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.URL || 'http://localhost:4173';
const OWN = ['localhost', '127.0.0.1', new URL(BASE).hostname]; // requests anywhere else count as external
const WIDTHS = (process.env.WIDTHS || '1440,1920').split(',').map(Number); // desktop pitch build
const HEIGHT = { 1440: 900, 1920: 1080, 1280: 720, 1024: 768, 390: 844, 768: 1024 };
const SHOE = ['top', 'shoe', 'finale']; // the only slides that show the 3D shoe

let failures = 0;
const fail = (msg) => { failures++; console.error('FAIL', msg); };
mkdirSync('shots', { recursive: true });

const browser = await chromium.launch({ channel: process.env.CHANNEL || 'msedge' });

async function open(width, { query = '', reducedMotion = 'no-preference', touch = false } = {}) {
  const page = await browser.newPage({ viewport: { width, height: HEIGHT[width] || 900 }, reducedMotion, hasTouch: touch, isMobile: touch && width < 900 });
  const errors = [];
  const external = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text())); // 4xx are logged with their URL below
  // Media requests get aborted when a page closes mid-download; that's not a site error.
  page.on('requestfailed', (r) => !/ERR_ABORTED/.test(r.failure()?.errorText || '') && errors.push(`request failed: ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (/^https?:$/.test(u.protocol) && !OWN.includes(u.hostname)) external.push(r.url());
  });
  await page.goto(BASE + '/' + query);
  try {
    await page.waitForSelector('html.is-ready', { timeout: 12000 });
    await page.waitForSelector('#preloader', { state: 'detached', timeout: 1000 });
  } catch {
    fail(`${width}${query}: preloader still up after 12 s`);
  }
  return { page, errors, external };
}

const state = (page) => page.evaluate(() => window.deck.state);
/** Wait until the glide is over and the slide's timeline has reached its current stop. */
const settle = (page) => page.waitForFunction(() => {
  const s = window.deck.state;
  return !s.busy && Math.abs(s.time - s.target) < 0.02;
}, null, { timeout: 15000, polling: 100 }).then(() => page.waitForTimeout(250));

async function checkSlide(page, where) {
  const r = await page.evaluate(() => {
    const el = document.querySelectorAll('main > .slide')[window.deck.state.index];
    const opacity = +getComputedStyle(document.getElementById('stage')).opacity;
    // Text that is on screen but cut off by the viewport edge (slides are exactly one screen, overflow hidden).
    const seen = (n) => { for (let e = n; e && e !== el; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < 0.05 || cs.display === 'none') return false; } return true; };
    const cut = [...el.querySelectorAll('h1, h2, h3, p, li, figcaption, td, th')]
      .filter((n) => !n.closest('.wk-track, .chapter-num, dialog') && seen(n))
      .filter((n) => { const b = n.getBoundingClientRect(); return b.width && (b.bottom > innerHeight + 1 || b.top < -1 || b.right > innerWidth + 1 || b.left < -1); })
      .map((n) => n.textContent.trim().slice(0, 40));
    return { id: el.id, opacity, cut, overflow: document.documentElement.scrollWidth - innerWidth, scroll: scrollY };
  });
  if (!SHOE.includes(r.id) && r.opacity > 0.01) fail(`${where}: 3D shoe visible (opacity ${r.opacity}) over #${r.id}`);
  if (r.cut.length) fail(`${where}: text cut off on #${r.id}: ${r.cut.join(' | ')}`);
  if (r.overflow > 1) fail(`${where}: horizontal overflow ${r.overflow}px`);
  if (r.scroll) fail(`${where}: the page scrolled (${r.scroll}px) — it should never scroll`);
}

/** Click through the whole deck with PageDown; returns the list of stops [{ index, id, stop }]. */
async function clickThrough(page, prefix, { shots = true } = {}) {
  const seen = [];
  const count = await page.evaluate(() => window.deck.count);
  await settle(page);
  for (let guard = 0; guard < 80; guard++) {
    const s = await state(page);
    seen.push(s);
    const name = `${prefix}-${String(s.index + 1).padStart(2, '0')}-${s.id}${s.stops > 1 ? `-${s.stop + 1}` : ''}`;
    if (shots) await page.screenshot({ path: `shots/${name}.png` });
    await checkSlide(page, name);
    if (s.index === count - 1 && s.stop === s.stops - 1) break;
    await page.keyboard.press('PageDown');
    await settle(page);
    const t = await state(page);
    const expected = s.stop < s.stops - 1 ? [s.index, s.stop + 1] : [s.index + 1, 0];
    if (t.index !== expected[0] || t.stop !== expected[1]) fail(`${name}: PageDown went to ${t.index + 1}.${t.stop + 1}, expected ${expected[0] + 1}.${expected[1] + 1}`);
  }
  if (seen.at(-1).index !== count - 1) fail(`${prefix}: never reached the last slide`);
  return seen;
}

for (const width of WIDTHS) {
  const { page, errors, external } = await open(width);
  if (await page.evaluate(() => document.documentElement.classList.contains('no-webgl'))) fail(`${width}: 3D failed and fell back to the still image`);
  const stops = await clickThrough(page, String(width));
  console.log(`${width}: ${stops.length} stops across ${await page.evaluate(() => window.deck.count)} slides`);
  // The shoe must actually show on its slides.
  for (const id of SHOE) {
    await page.evaluate((id) => window.deck.go([...document.querySelectorAll('main > .slide')].findIndex((s) => s.id === id)), id);
    await settle(page);
    const o = await page.evaluate(() => +getComputedStyle(document.getElementById('stage')).opacity);
    if (o < 0.5) fail(`${width} #${id}: 3D shoe not on screen (canvas opacity ${o})`);
  }
  if (errors.length) fail(`${width}: ${errors.length} error(s)\n  ` + [...new Set(errors)].join('\n  '));
  if (external.length) fail(`${width}: external requests\n  ` + external.join('\n  '));
  await page.close();
}

// iPad held sideways: still the deck, moved by finger swipes (one swipe = one step).
{
  const { page, errors } = await open(1024, { touch: true });
  if ((await page.evaluate(() => window.deck.mode)) !== 'deck') fail('1024×768 touch: expected the deck');
  const cdp = await page.context().newCDPSession(page);
  const swipe = async () => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 512, y: 540 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 512, y: 340 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await settle(page);
  const count = await page.evaluate(() => window.deck.count);
  let steps = 0;
  for (let s = await state(page); !(s.index === count - 1 && s.stop === s.stops - 1) && steps < 40; s = await state(page)) {
    await swipe();
    await page.waitForTimeout(200);
    await settle(page);
    const t = await state(page);
    if (t.index === s.index && t.stop === s.stop) { fail(`ipad: a swipe on #${s.id} did nothing`); break; }
    await checkSlide(page, `ipad ${t.id}`);
    steps++;
  }
  if ((await state(page)).index !== count - 1) fail('ipad: swiping never reached the last slide');
  await page.screenshot({ path: 'shots/ipad-last.png' });
  if (errors.length) fail('ipad: ' + [...new Set(errors)].join('\n  '));
  await page.close();
}

// Phones and upright tablets: one long page. Scroll it all; each screen must fit sideways, keep its text in view,
// and only show the 3D shoe while one of its slots is on screen.
for (const width of [390, 768]) {
  const { page, errors, external } = await open(width, { touch: true });
  if ((await page.evaluate(() => window.deck.mode)) !== 'scroll') fail(`${width}: expected scroll mode`);
  const H = HEIGHT[width];
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0, i = 0; y < total; y += Math.round(H * 0.85), i++) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(900);
    if (i % 3 === 0) await page.screenshot({ path: `shots/${width}-scroll-${String(i).padStart(2, '0')}.png` });
    const r = await page.evaluate(() => {
      const opacity = +getComputedStyle(document.getElementById('stage')).opacity;
      const slotOnScreen = [...document.querySelectorAll('.shoe-slot')].some((s) => { const b = s.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight; });
      const seen = (n) => { for (let e = n; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < 0.05 || cs.display === 'none') return false; } return true; };
      const cut = [...document.querySelectorAll('main h1, main h2, main h3, main p, main li, main figcaption')]
        .filter((n) => !n.closest('.wk-track, .chapter-num, dialog'))
        .filter((n) => { const b = n.getBoundingClientRect(); return b.width && b.bottom > 0 && b.top < innerHeight && (b.right > innerWidth + 1 || b.left < -1); })
        .filter(seen).map((n) => n.textContent.trim().slice(0, 30));
      return { overflow: document.documentElement.scrollWidth - innerWidth, opacity, slotOnScreen, cut };
    });
    if (r.overflow > 1) fail(`${width} scroll y=${y}: sideways overflow ${r.overflow}px`);
    if (r.opacity > 0.01 && !r.slotOnScreen) fail(`${width} scroll y=${y}: 3D shoe visible (opacity ${r.opacity}) with none of its slides on screen`);
    if (r.cut.length) fail(`${width} scroll y=${y}: text cut off sideways: ${r.cut.join(' | ')}`);
  }
  if (errors.length) fail(`${width}: ` + [...new Set(errors)].join('\n  '));
  if (external.length) fail(`${width}: external requests
  ` + external.join('\n  '));
  await page.close();
}

// Loading screen: the shoe's pattern drawing draws itself while it loads, then the x-ray scan turns it into the 3D shoe.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/');
  await page.waitForTimeout(1400);
  const drawn = await page.evaluate(() => {
    const o = document.querySelector('.bp-outline');
    return o ? 1 - parseFloat(getComputedStyle(o).strokeDashoffset) / o.getTotalLength() : 0;
  });
  if (drawn < 0.2) fail(`loading: the drawing is only ${Math.round(drawn * 100)}% drawn after 1.4 s`);
  await page.screenshot({ path: 'shots/preloader-drawing.png' });
  await page.waitForSelector('#preloader.is-leaving', { timeout: 12000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'shots/preloader-scan.png' });
  await page.waitForSelector('html.is-ready', { timeout: 6000 });
  await settle(page);
  await page.screenshot({ path: 'shots/preloader-done.png' });
  await checkSlide(page, 'after loading');
  await page.close();
}

// Presenter controls: back steps through builds, header links, wheel gestures, F5 → slide 1.
{
  const { page, errors } = await open(1440);
  await settle(page);
  const go = async (id) => {
    await settle(page); // the deck ignores input mid-glide
    await page.evaluate((id) => window.deck.go([...document.querySelectorAll('main > .slide')].findIndex((s) => s.id === id)), id);
    await settle(page);
  };
  // Forward onto the zone's build, then back: build reverses first, then the previous slide shows fully built.
  await go('zone');
  await page.keyboard.press('ArrowRight');
  await settle(page);
  let s = await state(page);
  if (s.id !== 'zone' || s.stop !== 1) fail(`build: expected zone click 2, got ${s.id} ${s.stop + 1}`);
  await page.keyboard.press('ArrowLeft');
  await settle(page);
  s = await state(page);
  if (s.id !== 'zone' || s.stop !== 0) fail(`back: expected zone click 1, got ${s.id} ${s.stop + 1}`);
  await go('audience');
  await go('zone');
  await page.keyboard.press('ArrowLeft');
  await settle(page);
  s = await state(page);
  if (s.id !== 'audience') fail(`back: expected audience, got ${s.id}`);
  await go('unseen-hours');
  await page.keyboard.press('PageDown');
  await settle(page);
  await page.keyboard.press('PageDown');
  await settle(page);
  await page.keyboard.press('PageUp');
  await settle(page);
  s = await state(page);
  if (s.id !== 'unseen-hours' || s.stop !== s.stops - 1) fail(`back: expected the Unseen Hours end frame, got ${s.id} ${s.stop + 1}`);
  await page.screenshot({ path: 'shots/back-unseen-end.png' });

  for (const href of ['#objective', '#shoe', '#zone', '#route-01', '#route-02']) {
    await page.click(`.nav a[href="${href}"]`);
    await settle(page);
    s = await state(page);
    if ('#' + s.id !== href) fail(`nav ${href}: landed on #${s.id}`);
    await checkSlide(page, `nav ${href}`);
  }

  // One trackpad flick with a long inertia tail = exactly one step.
  await go('objective');
  await page.mouse.move(720, 450);
  const before = await state(page);
  for (let i = 0; i < 60; i++) {
    await page.mouse.wheel(0, Math.max(4, 120 - i * 2));
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(300); // wheel events land asynchronously
  await settle(page);
  s = await state(page);
  if (s.index !== before.index + 1) fail(`wheel: one gesture moved ${s.index - before.index} slides`);
  await page.waitForTimeout(400);
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(300);
  await settle(page);
  s = await state(page);
  if (s.index !== before.index) fail(`wheel back: at slide ${s.index + 1}, expected ${before.index + 1}`);

  // Film dialog: opens, Space doesn't change slides while it's open, closes.
  await go('unseen-hours');
  await page.keyboard.press('PageDown');
  await settle(page);
  await page.click('.uh-play');
  await page.keyboard.press(' ');
  await page.waitForTimeout(600);
  if ((await state(page)).id !== 'unseen-hours') fail('film: a key press changed slides while the film was open');
  await page.click('.film-close');
  await page.keyboard.press('PageDown');
  await settle(page);
  if ((await state(page)).id !== 'unposted') fail('film: after closing, the clicker did not move on');

  await go('finale');
  await page.reload();
  await page.waitForSelector('html.is-ready', { timeout: 12000 });
  s = await state(page);
  if (s.index !== 0) fail(`reload: started on slide ${s.index + 1}, expected 1`);
  if (errors.length) fail('controls: ' + [...new Set(errors)].join('\n  '));
  await page.close();
}

// Smoothness (informational): frame times across ten slide transitions.
// Headless may render without the GPU, so treat these numbers as a floor, not the pitch-laptop result.
if (!process.env.SKIP_PERF) {
  const { page } = await open(1440);
  await settle(page);
  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    const loop = (t) => { window.__frames.push(t - last); last = t; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.deck.go(window.deck.state.index + 1));
    await page.waitForTimeout(1600);
  }
  const stats = await page.evaluate(() => {
    const f = window.__frames.slice(5).sort((a, b) => a - b);
    const p = (q) => f[Math.floor(f.length * q)].toFixed(1);
    return { frames: f.length, p50: p(0.5), p95: p(0.95), slow: f.filter((x) => x > 50).length };
  });
  console.log('perf (headless, 1440):', JSON.stringify(stats));
  await page.close();
}

// WebGL unavailable → fallback image instead of the 3D shoe.
{
  const { page, errors } = await open(1440, { query: '?nowebgl' });
  await settle(page);
  if (!(await page.isVisible('.hero .shoe-fallback'))) fail('nowebgl: hero fallback image not visible');
  await page.screenshot({ path: 'shots/nowebgl.png' });
  if (errors.length) fail('nowebgl: ' + [...new Set(errors)].join('\n  '));
  await page.close();
}

// Reduced motion → every slide and build appears at once, nothing moves.
{
  const { page, errors } = await open(1440, { reducedMotion: 'reduce' });
  await clickThrough(page, 'reduced', { shots: false });
  if (errors.length) fail('reduced: ' + [...new Set(errors)].join('\n  '));
  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} failure(s)` : '\nSMOKE PASS');
process.exit(failures ? 1 : 0);
