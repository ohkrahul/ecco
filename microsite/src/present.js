import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PHASE_AT } from './sections/flow.js';

/**
 * Slide mode for presenting next to the deck. Each stop is one "slide": a clicker / arrow key / Space
 * glides to the next one. `at` = progress through a pinned section (0..1); `panel` = index of a panel in the
 * horizontal Don't-tell-them track; otherwise the stop is the element's top.
 * `deck` = matching slide in ECCO_India_Launch_23 Nov.pptx.
 */
function flowStops(sel, route, names) {
  return names.map((n, i) => ({ sel, at: PHASE_AT[i], label: `${route} · ${i + 1} ${n}`, deck: 'flow' }));
}

export const STOPS = [
  { sel: '#top', at: 0, label: 'ECCO India — Walk Your Walk.', deck: '1' },
  { sel: '#brief', label: 'Business objective', deck: '2' },
  { sel: '#expectation', label: 'Pitch expectation', deck: '3' },
  { sel: '#brand', label: 'The brand', deck: '4' },
  { sel: '#shoe', at: 0.42, label: 'Key USPs', deck: '5' },
  { sel: '#shoe', at: 0.8, label: 'Key USPs — all five', deck: '5' },
  { sel: '#category', label: 'The category', deck: '6' },
  { sel: '#category-wall', at: 0.62, label: 'Category campaigns', deck: '7' },
  { sel: '#category-wall', at: 0.98, label: 'And ECCO?', deck: '7' },
  { sel: '#audience', label: 'Audience understanding', deck: '8' },
  { sel: '#zone', at: 0.52, label: 'Recommended zone', deck: '9' },
  { sel: '#zone', at: 0.98, label: 'Understated by Choice', deck: '9' },
  { sel: '#route-01', label: 'Route 01 — Manifestation 1', deck: '10' },
  { sel: '#dont-tell', panel: 0, label: 'Master a skill. Don’t tell them.', deck: '10' },
  { sel: '#dont-tell', panel: 1, label: 'Key visual 01', deck: '11' },
  { sel: '#dont-tell', panel: 3, label: 'Key visual 02', deck: '11' },
  { sel: '#dont-tell', panel: 5, label: 'Key visual 03', deck: '11' },
  { sel: '#dont-tell', panel: 6, label: 'Key visual 04', deck: '11' },
  { sel: '#dont-tell', panel: 7, label: 'Just Because. — the set', deck: '12' },
  { sel: '#unseen-hours', at: 0, label: 'The Unseen Hours', deck: '13' },
  { sel: '#unseen-hours', at: 0.46, label: 'The Unseen Hours — the film', deck: '13' },
  { sel: '#unseen-hours', at: 0.98, label: 'Even when no one’s watching.', deck: '13' },
  { sel: '#unposted', label: '#EccoUnPosted', deck: '14' },
  { sel: '#unposted .slide-part', label: '#EccoUnPosted — formats', deck: '14' },
  { sel: '#practice-club', label: 'ECCO Practice Club', deck: '15' },
  { sel: '#practice-club .slide-part', label: 'Practice Club — how it works', deck: '15' },
  { sel: '#spotted', label: 'Celebrities spotted in ECCO', deck: '16' },
  { sel: '#spotted .slide-part', label: 'Spotted — the names', deck: '16' },
  ...flowStops('#flow-01', 'Route 01 flow', ['Seed — Spotted in ECCO', 'Launch — the films', 'Join in — #EccoUnPosted', 'Try — Practice Club', 'Belong — Owners’ Club']),
  { sel: '#route-02', label: 'Route 02 — Manifestation 2', deck: '17' },
  { sel: '#not-in-ecco', label: 'Out of home', deck: '18–20' },
  { sel: '#installations', label: 'Product-focused installations', deck: '21' },
  { sel: '#traffic', label: 'Too much traffic. So they walked.', deck: '22' },
  { sel: '#one-pair', at: 0.1, label: 'One Pair. Everywhere.', deck: '23' },
  { sel: '#one-pair', at: 0.98, label: 'One pair — the whole trip', deck: '23' },
  { sel: '#city', label: 'ECCO × BookMyShow', deck: '24' },
  ...flowStops('#flow-02', 'Route 02 flow', ['Seed — the traffic walk', 'Launch — the OOH takeover', 'Prove — One Pair. Everywhere.', 'Try — ECCO After Hours', 'Belong — Walking Club']),
  { sel: '#owners', label: 'ECCO Owners’ Club', deck: '25' },
  { sel: '#compare', label: 'Two routes, one brief', deck: 'flow' },
  { sel: '#finale', label: 'Thank you', deck: 'end' },
];

const FORWARD = new Set(['PageDown', 'ArrowDown', 'ArrowRight', ' ', 'Enter']);
const BACK = new Set(['PageUp', 'ArrowUp', 'ArrowLeft', 'Backspace']);

let lenis = null;
let ys = [];

/** Scroll position of a stop, measured against the current layout (pins included). */
function stopY(stop) {
  const el = document.querySelector(stop.sel);
  if (!el) return null;
  const st = ScrollTrigger.getAll().find((t) => t.pin === el);
  if (st && stop.panel !== undefined) {
    const track = el.querySelector('.dt-track');
    const panel = track.children[stop.panel];
    const distance = track.scrollWidth - innerWidth;
    const f = Math.min(1, Math.max(0, (panel.offsetLeft + panel.offsetWidth / 2 - innerWidth / 2) / distance));
    return st.start + (st.end - st.start) * f;
  }
  if (st) return st.start + (st.end - st.start) * (stop.at ?? 0);
  return Math.max(0, el.getBoundingClientRect().top + scrollY);
}

const measure = () => (ys = STOPS.map(stopY));

function glide(y) {
  if (!lenis) return scrollTo(0, y);
  const distance = Math.abs(y - lenis.targetScroll);
  lenis.scrollTo(y, {
    duration: Math.min(2.4, 0.9 + distance / 3000),
    easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  });
}

/** Go to the next (+1) or previous (-1) stop relative to where the scroll is heading. */
export function step(dir) {
  measure();
  const from = lenis ? lenis.targetScroll : scrollY;
  const i = dir > 0 ? ys.findIndex((y) => y > from + 4) : ys.findLastIndex((y) => y < from - 4);
  if (i >= 0) glide(ys[i]);
}

/** Header links: first stop of that section (so pinned sections never land on a blank frame). */
export function goToSection(hash) {
  if (hash === '#top') return glide(0);
  const i = STOPS.findIndex((s) => s.sel === hash);
  const y = i >= 0 ? stopY(STOPS[i]) : stopY({ sel: hash });
  if (y !== null) glide(y);
}

export function init(ctx) {
  lenis = ctx.lenis;
  measure();
  ScrollTrigger.addEventListener('refresh', measure);
  window.stops = () => measure().map((y, i) => ({ ...STOPS[i], y })); // read by scripts/smoke.mjs

  // HUD: on by default on localhost (the pitch laptop) or with ?present; P toggles it anywhere.
  const hud = document.createElement('div');
  hud.className = 'present-hud';
  hud.innerHTML = `<button class="ph-btn" type="button" aria-label="Previous slide">‹</button>
    <span class="ph-count"></span><span class="ph-label"></span><span class="ph-deck"></span>
    <button class="ph-btn" type="button" aria-label="Next slide">›</button>`;
  const [prev, count, label, deck, next] = hud.children;
  hud.hidden = !(new URLSearchParams(location.search).has('present') || /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
  document.body.append(hud);
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));

  let shown = -1;
  let fresh;
  const update = () => {
    const y = (lenis ? lenis.scroll : scrollY) + 6;
    let i = 0;
    ys.forEach((v, j) => { if (v !== null && v <= y) i = j; });
    if (i === shown) return;
    shown = i;
    count.textContent = `${String(i + 1).padStart(2, '0')} / ${STOPS.length}`;
    label.textContent = STOPS[i].label;
    deck.textContent = { end: 'Close', flow: 'Campaign flow' }[STOPS[i].deck] ?? `Deck slide ${STOPS[i].deck}`;
    hud.classList.add('is-fresh');
    clearTimeout(fresh);
    fresh = setTimeout(() => hud.classList.remove('is-fresh'), 2500);
  };
  update();
  lenis ? lenis.on('scroll', update) : addEventListener('scroll', update, { passive: true });
  ScrollTrigger.addEventListener('refresh', () => { shown = -1; update(); });

  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
    if (document.querySelector('dialog[open], .nav.is-open')) return;
    if (e.key === 'p' || e.key === 'P') return void (hud.hidden = !hud.hidden);
    if (e.key === 'Home') return void (e.preventDefault(), glide(0));
    if (e.key === 'End') return void (e.preventDefault(), glide(ys[ys.length - 1]));
    const dir = FORWARD.has(e.key) ? 1 : BACK.has(e.key) ? -1 : 0;
    if (!dir) return;
    if ((e.key === ' ' || e.key === 'Enter') && e.target.closest?.('button, a')) return; // let buttons work
    e.preventDefault();
    step(dir);
  });
}
