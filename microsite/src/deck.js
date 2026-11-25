import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

/**
 * Two ways through the pitch, decided once per load:
 * - deck (laptops, desktops, tablets held sideways): one click / key / wheel gesture / swipe = one slide, no
 *   scrolling. A label in a slide's timeline is a "build" (like a PowerPoint click): the next click plays on to it.
 * - scroll (phones, upright tablets, very short screens): one long page; each slide's timeline plays through,
 *   builds included, as it comes into view.
 * Each slide registers a build(tl, el) that fills a paused timeline when the slide arrives; everything it creates
 * (tweens, SplitText, set()) is reverted once the slide has left.
 */
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const modeQuery = matchMedia('(max-width: 899px), (max-height: 559px), (orientation: portrait) and (max-width: 1199px)');
export const scrollMode = modeQuery.matches;
document.documentElement.classList.toggle('is-scroll', scrollMode);

const main = document.querySelector('main');
const slides = [...document.querySelectorAll('main > .slide')];
const builds = new Map();
const MOVE = 1.1; // seconds for the slide-to-slide glide
const SCROLL_PLAY = 1.4; // seconds: on the scrolling page a slide's whole entrance is compressed to this (people scroll on)

/** build(tl, el) → optional leave() run as the slide starts to go (pause video, fade the 3D shoe). */
export const slide = (id, build) => builds.set(id, build);

let index = -1;
let current = null; // deck: { el, tl, ctx, leave, stops }
let stop = 0;
let busy = false;
let playing = null;

const snap = () => gsap.set(main, { y: -slides[index].offsetTop });

function playTo(t, vars) {
  playing?.kill();
  playing = null;
  if (reduced) current.tl.time(t);
  else playing = current.tl.tweenTo(t, vars);
  update();
}

function build(el) {
  const tl = gsap.timeline({ paused: true });
  let leave;
  const ctx = gsap.context(() => {
    const reveal = el.querySelectorAll('[data-reveal]');
    if (reveal.length) tl.from(reveal, { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08 }, 0);
    leave = builds.get(el.id)?.(tl, el);
  });
  const stops = [...new Set([...Object.values(tl.labels), tl.duration()])].sort((a, b) => a - b);
  return { el, tl, ctx, leave, stops };
}

export function go(n, { back = false, delay = 0.45 } = {}) {
  if (scrollMode) return slides[n]?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  if (busy || n === index || !slides[n]) return;
  const first = index < 0;
  const prev = current;
  playing?.kill();
  prev?.leave?.();
  index = n;
  slides.forEach((el, i) => (el.inert = i !== n));
  current = build(slides[n]);
  stop = back ? current.stops.length - 1 : 0;
  if (back) current.tl.time(current.stops[stop]);
  busy = !(first || reduced);
  gsap.to(main, {
    y: -slides[n].offsetTop,
    duration: busy ? MOVE : 0,
    ease: 'expo.inOut',
    overwrite: true,
    onComplete() {
      busy = false;
      snap(); // in case the window was resized mid-glide
      prev?.ctx.revert();
    },
  });
  if (back) update();
  else playTo(current.stops[0], { delay });
}

export function next() {
  if (busy) return;
  if (stop < current.stops.length - 1) return playTo(current.stops[++stop]);
  go(index + 1);
}

export function prev() {
  if (busy) return;
  if (stop > 0) return playTo(current.stops[--stop]);
  go(index - 1, { back: true });
}

// ---- Scroll mode ---------------------------------------------------------------------
const live = new Map(); // slide id → built slide, while it's on screen (several can be)

function startScroll(delay) {
  let first = delay;
  // A slide is built (what's about to animate is hidden) while it's still half a screen away, so nothing on screen
  // ever snaps back; it's reverted once it's that far gone again.
  const ensure = (el, fromAbove) => {
    let b = live.get(el.id);
    if (b) return b;
    b = build(el);
    live.set(el.id, b);
    if (fromAbove) {
      // coming back up from below: show it finished rather than replaying what was already read
      b.started = true;
      b.tl.progress(1);
    }
    return b;
  };
  const near = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const s = live.get(e.target.id);
      if (e.isIntersecting) ensure(e.target, e.boundingClientRect.top < 0);
      else if (s) {
        s.playing?.kill();
        s.leave?.();
        s.ctx.revert();
        live.delete(e.target.id);
      }
    }
  }, { rootMargin: '50% 0px' });
  // It plays as it actually comes into view (its top past 90% of the screen); builds included.
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const b = ensure(e.target, e.boundingClientRect.top < 0);
      if (b.started) continue;
      b.started = true;
      if (reduced) b.tl.progress(1);
      // slide 1 keeps its own pace: its entrance is the hand-off from the loading screen
      else if (e.target === slides[0]) b.playing = b.tl.tweenTo(b.tl.duration(), { delay: first });
      else b.playing = b.tl.tweenTo(b.tl.duration(), { duration: Math.min(b.tl.duration(), SCROLL_PLAY) || 0.01 });
      if (e.target === slides[0]) first = 0;
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  slides.forEach((el) => {
    near.observe(el);
    seen.observe(el);
  });
  addEventListener('scroll', update, { passive: true });
}

/** The slide under the header in scroll mode (drives the header theme, active link, progress). */
function underHeader() {
  const y = header.offsetHeight;
  const i = slides.findIndex((el) => el.getBoundingClientRect().bottom > y);
  return i < 0 ? slides.length - 1 : i;
}

// ---- Header + presenter HUD ------------------------------------------------------
const header = document.getElementById('site-header');
const chapter = header.querySelector('.chapter-label');
const progress = header.querySelector('.progress');
const nav = header.querySelector('.nav');
const menuBtn = header.querySelector('.menu-btn');
const navLinks = [...nav.querySelectorAll('a')].map((a) => ({ a, i: slides.findIndex((s) => '#' + s.id === a.getAttribute('href')) }));
const hud = document.createElement('div');
hud.className = 'present-hud';
hud.innerHTML = `<button class="ph-btn" type="button" aria-label="Previous">‹</button>
  <span class="ph-count"></span><span class="ph-label"></span><span class="ph-deck"></span><span class="ph-step"></span>
  <button class="ph-btn" type="button" aria-label="Next">›</button>`;
const [hudPrev, hudCount, hudLabel, hudDeck, hudStep, hudNext] = hud.children;
let fresh;

function update() {
  const i = scrollMode ? underHeader() : index;
  const d = slides[i].dataset;
  header.classList.toggle('on-dark', d.theme === 'dark');
  chapter.textContent = d.chapter || '';
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${scrollMode ? (max > 0 ? scrollY / max : 0) : i / (slides.length - 1)})`;
  const active = navLinks.findLast((l) => l.i >= 0 && l.i <= i);
  navLinks.forEach((l) => l.a.classList.toggle('is-active', l === active && i > 0));
  if (scrollMode) return;

  hudCount.textContent = `${String(i + 1).padStart(2, '0')} / ${slides.length}`;
  hudLabel.textContent = d.label;
  hudDeck.textContent = { end: 'Close', flow: 'Campaign flow' }[d.deck] ?? `Deck slide ${d.deck}`;
  hudStep.textContent = current.stops.length > 1 ? `click ${stop + 1}/${current.stops.length}` : '';
  hud.classList.add('is-fresh');
  clearTimeout(fresh);
  fresh = setTimeout(() => hud.classList.remove('is-fresh'), 2500);
}

function setMenu(open) {
  nav.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Close' : 'Menu';
}

// ---- Input -----------------------------------------------------------------------------
const FORWARD = new Set(['PageDown', 'ArrowDown', 'ArrowRight', ' ', 'Enter']);
const BACK = new Set(['PageUp', 'ArrowUp', 'ArrowLeft', 'Backspace']);
const dialogOpen = () => !!document.querySelector('dialog[open]');

function listen() {
  navLinks.forEach(({ a, i }) => a.addEventListener('click', (e) => (e.preventDefault(), setMenu(false), go(i))));
  header.querySelector('.logo').addEventListener('click', (e) => (e.preventDefault(), setMenu(false), go(0)));
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
  if (scrollMode) return; // the page scrolls natively

  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.repeat || e.metaKey || e.ctrlKey || e.altKey || dialogOpen()) return;
    if (e.key === 'p' || e.key === 'P') return void (hud.hidden = !hud.hidden);
    if (e.key === 'Home') return void (e.preventDefault(), go(0));
    if (e.key === 'End') return void (e.preventDefault(), go(slides.length - 1));
    const dir = FORWARD.has(e.key) ? 1 : BACK.has(e.key) ? -1 : 0;
    if (!dir || ((e.key === ' ' || e.key === 'Enter') && e.target.closest?.('button, a'))) return; // let buttons work
    e.preventDefault();
    dir > 0 ? next() : prev();
  });

  // One wheel / trackpad gesture = one step. A gesture ends after a short pause in wheel events,
  // so trackpad inertia never skips a slide.
  let lastWheel = 0;
  let used = false;
  addEventListener('wheel', (e) => {
    const now = performance.now();
    if (now - lastWheel > 220) used = false;
    lastWheel = now;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (used || Math.abs(d) < 4 || dialogOpen()) return;
    used = true;
    d > 0 ? next() : prev();
  }, { passive: true });

  // Touch (tablets held sideways): swipe up or left = next, down or right = back.
  let touch = null;
  addEventListener('touchstart', (e) => (touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null), { passive: true });
  addEventListener('touchend', (e) => {
    if (!touch || dialogOpen()) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    touch = null;
    const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (Math.abs(d) >= 40) d < 0 ? next() : prev();
  }, { passive: true });

  hudPrev.addEventListener('click', prev);
  hudNext.addEventListener('click', next);
  addEventListener('resize', () => !busy && snap());
}

/** Enter slide 1 (or the slide a mode-switch reload left from). `delay` lets slide 1 wait for the preloader. */
export function start(delay = 0) {
  let resume = null;
  try {
    resume = sessionStorage.getItem('resume');
    sessionStorage.removeItem('resume');
  } catch {} // storage blocked: start at slide 1
  const at = Math.max(0, slides.findIndex((s) => s.id === resume));
  // Turning a tablet across the boundary switches mode: reload into the other one, at the same slide. Touch devices
  // only: on a laptop a resized window (snapped to half the screen, DevTools, zoom) keeps the mode it loaded in.
  if (matchMedia('(pointer: coarse)').matches) modeQuery.addEventListener('change', () => {
    try {
      sessionStorage.setItem('resume', slides[scrollMode ? underHeader() : index].id);
    } catch {}
    location.reload();
  });

  setMenu(false);
  listen();
  if (scrollMode) {
    history.scrollRestoration = 'manual';
    scrollTo(0, at ? slides[at].offsetTop : 0);
    startScroll(at ? 0 : delay);
    update();
  } else {
    // HUD: on by default on localhost (the pitch laptop) or with ?present; P toggles it anywhere.
    hud.hidden = !(new URLSearchParams(location.search).has('present') || /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
    document.body.append(hud);
    go(at, { delay: at ? 0.45 : delay });
  }
  // read by scripts/smoke.mjs
  window.deck = {
    mode: scrollMode ? 'scroll' : 'deck', go, next, prev, count: slides.length,
    get state() {
      if (scrollMode) return { mode: 'scroll', index: underHeader(), id: slides[underHeader()].id, live: [...live.keys()] };
      return { mode: 'deck', index, id: slides[index].id, stop, stops: current.stops.length, busy, time: current.tl.time(), target: current.stops[stop] };
    },
  };
}
