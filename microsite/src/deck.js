import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

/**
 * Slide engine for the pitch: one click / key / wheel gesture = one slide, no scrolling.
 * Each slide registers a build(tl, el) that fills a paused timeline when the slide arrives; the timeline
 * plays by itself. A label in it is a "build" (like a PowerPoint click): the next click plays on to it.
 * Everything a build creates (tweens, SplitText, set()) is reverted once the slide has left.
 */
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const main = document.querySelector('main');
const slides = [...document.querySelectorAll('main > .slide')];
const builds = new Map();
const MOVE = 1.1; // seconds for the slide-to-slide glide

/** build(tl, el) → optional leave() run as the slide starts to go (pause video, fade the 3D shoe). */
export const slide = (id, build) => builds.set(id, build);

let index = -1;
let current = null; // { el, tl, ctx, leave, stops }
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

// ---- Header + presenter HUD ------------------------------------------------------
const header = document.getElementById('site-header');
const chapter = header.querySelector('.chapter-label');
const progress = header.querySelector('.progress');
const navLinks = [...header.querySelectorAll('.nav a')].map((a) => ({ a, i: slides.findIndex((s) => '#' + s.id === a.getAttribute('href')) }));
const hud = document.createElement('div');
hud.className = 'present-hud';
hud.innerHTML = `<button class="ph-btn" type="button" aria-label="Previous">‹</button>
  <span class="ph-count"></span><span class="ph-label"></span><span class="ph-deck"></span><span class="ph-step"></span>
  <button class="ph-btn" type="button" aria-label="Next">›</button>`;
const [hudPrev, hudCount, hudLabel, hudDeck, hudStep, hudNext] = hud.children;
let fresh;

function update() {
  const el = slides[index];
  const d = el.dataset;
  header.classList.toggle('on-dark', d.theme === 'dark');
  chapter.textContent = d.chapter || '';
  progress.style.transform = `scaleX(${index / (slides.length - 1)})`;
  const active = navLinks.findLast((l) => l.i >= 0 && l.i <= index);
  navLinks.forEach((l) => l.a.classList.toggle('is-active', l === active && index > 0));

  hudCount.textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
  hudLabel.textContent = d.label;
  hudDeck.textContent = { end: 'Close', flow: 'Campaign flow' }[d.deck] ?? `Deck slide ${d.deck}`;
  hudStep.textContent = current.stops.length > 1 ? `click ${stop + 1}/${current.stops.length}` : '';
  hud.classList.add('is-fresh');
  clearTimeout(fresh);
  fresh = setTimeout(() => hud.classList.remove('is-fresh'), 2500);
}

// ---- Input -----------------------------------------------------------------------------
const FORWARD = new Set(['PageDown', 'ArrowDown', 'ArrowRight', ' ', 'Enter']);
const BACK = new Set(['PageUp', 'ArrowUp', 'ArrowLeft', 'Backspace']);
const dialogOpen = () => !!document.querySelector('dialog[open]');

function listen() {
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

  navLinks.forEach(({ a, i }) => a.addEventListener('click', (e) => (e.preventDefault(), go(i))));
  header.querySelector('.logo').addEventListener('click', (e) => (e.preventDefault(), go(0)));
  hudPrev.addEventListener('click', prev);
  hudNext.addEventListener('click', next);
  addEventListener('resize', () => !busy && snap());
}

/** Enter slide 1. `delay` lets its entrance wait for the preloader to open. */
export function start(delay = 0) {
  // HUD: on by default on localhost (the pitch laptop) or with ?present; P toggles it anywhere.
  hud.hidden = !(new URLSearchParams(location.search).has('present') || /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
  document.body.append(hud);
  listen();
  go(0, { delay });
  // read by scripts/smoke.mjs
  window.deck = {
    go, next, prev, count: slides.length,
    get state() { return { index, id: slides[index].id, stop, stops: current.stops.length, busy, time: current.tl.time(), target: current.stops[stop] }; },
  };
}
