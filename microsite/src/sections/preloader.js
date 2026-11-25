import gsap from 'gsap';
import { reduced } from '../deck.js';
import { VIEW, BODY, OUTLINE, STITCH, PLACE } from './shoe-outline.js';
import { viewWidth } from '../stage.js';

/**
 * Loading screen — "Blueprint": a pattern drawing of the shoe (traced from the 3D shoe at rest) draws itself as the
 * site loads. Then slide 1's x-ray scan (hero.js) turns the drawing into the real leather shoe, in the same spot.
 */
const MIN_TIME = 2.6; // seconds: the drawing never finishes faster than this, however fast the site loads
/** When slide 1's scan starts, in seconds into exit(). */
export const introDelay = 0.25;

// Eyelets and construction notes as fractions of the shoe's box (BODY), so they follow a re-traced outline.
const EYELETS = [[0.288, 0.347], [0.363, 0.426], [0.434, 0.504], [0.509, 0.582]];
const NOTES = [
  { at: [0.08, 0.07], to: [-0.08, -0.07], text: 'Heel' },
  { at: [0.57, 0.36], to: [0.65, 0.1], text: 'Upper' },
  { at: [0.995, 0.8], to: [1.07, 0.66], text: 'Toe' },
  { at: [0.36, 0.89], to: [0.26, 1.02], text: 'Sole' },
];

const el = document.getElementById('preloader');
let drawing;
let outline;
let stitch;
let eyelets;
let notes;
let grid;
let length;

function setup() {
  const [x0, y0, x1, y1] = BODY;
  const bw = x1 - x0;
  const bh = y1 - y0;
  const pt = ([fx, fy]) => [x0 + fx * bw, y0 + fy * bh];
  // Same place and size as slide 1's 3D shoe: centred on its slot, scaled like the 3D view (PLACE was measured
  // at 1440×900, in screen widths from the slot centre).
  const slot = document.querySelector('#top .shoe-slot').getBoundingClientRect();
  const f = (innerWidth * viewWidth(1440, 900)) / viewWidth(innerWidth, innerHeight); // px per measured screen width
  const k = (PLACE.w * f) / bw; // screen px per drawing unit
  const left = slot.left + slot.width / 2 + PLACE.cx * f - (x0 + bw / 2) * k;
  const top = slot.top + slot.height / 2 + PLACE.cy * f - (y0 + bh / 2) * k;
  const dimY = y1 + 0.17 * bh;
  el.insertAdjacentHTML('afterbegin', `<div class="pl-blueprint">
      <div class="bp-grid"></div>
      <svg class="bp-draw" viewBox="0 0 ${VIEW.w} ${VIEW.h}" style="left:${left}px;top:${top}px;width:${VIEW.w * k}px;height:${VIEW.h * k}px">
        <path class="bp-outline" d="${OUTLINE}" />
        <path class="bp-stitch" d="${STITCH}" />
        ${EYELETS.map((e) => pt(e)).map(([x, y]) => `<circle class="bp-eyelet" cx="${x}" cy="${y}" r="${0.012 * bw}" />`).join('')}
        ${NOTES.map((n) => {
          const [ax, ay] = pt(n.at);
          const [tx, ty] = pt(n.to);
          return `<g class="bp-note"><circle cx="${ax}" cy="${ay}" r="${0.006 * bw}" /><path d="M${ax} ${ay} L${tx} ${ty}" /><text x="${tx}" y="${ty - 0.014 * bw}">${n.text}</text></g>`;
        }).join('')}
        <g class="bp-note bp-dim"><path d="M${x0} ${dimY} L${x1} ${dimY} M${x0} ${dimY - 18} L${x0} ${dimY + 18} M${x1} ${dimY - 18} L${x1} ${dimY + 18}" /><text x="${x0 + bw / 2}" y="${dimY + 46}">Pattern 01 · ECCO India</text></g>
      </svg>
    </div>`);
  drawing = el.querySelector('.bp-draw');
  grid = el.querySelector('.bp-grid');
  outline = drawing.querySelector('.bp-outline');
  stitch = drawing.querySelector('.bp-stitch');
  eyelets = [...drawing.querySelectorAll('.bp-eyelet')];
  notes = [...drawing.querySelectorAll('.bp-note')];
  length = outline.getTotalLength();
  gsap.set(outline, { strokeDasharray: length, strokeDashoffset: length });
  gsap.set([stitch, ...eyelets, ...notes], { opacity: 0 });
}

const between = (v, a, b) => gsap.utils.clamp(0, 1, (v - a) / (b - a));

/** shown 0..1: the pen goes round the shoe, then the stitch line, eyelets, and notes. */
function draw(shown) {
  gsap.set(outline, { strokeDashoffset: length * (1 - between(shown, 0, 0.62)) });
  gsap.set(stitch, { opacity: between(shown, 0.55, 0.75) });
  eyelets.forEach((e, i) => gsap.set(e, { opacity: between(shown, 0.62 + i * 0.04, 0.68 + i * 0.04) }));
  notes.forEach((n, i) => gsap.set(n, { opacity: between(shown, 0.78 + i * 0.04, 0.86 + i * 0.04) }));
}

/** Paces the drawing at no faster than MIN_TIME; resolves when loading has settled and the drawing is complete. */
export function load({ ready, progress, cap = 6000 }) {
  document.documentElement.classList.add('is-loading'); // header waits until the intro is done
  setup();
  const count = el.querySelector('.pl-count');
  const settled = Promise.race([Promise.allSettled([ready]), new Promise((r) => setTimeout(r, cap))]);
  if (reduced) return settled;
  let done = false;
  settled.then(() => (done = true));

  return new Promise((resolve) => {
    let shown = 0;
    const tick = (_t, deltaMs) => {
      const target = done ? 1 : Math.min(progress(), 1) * 0.92;
      shown = Math.min(target, shown + deltaMs / 1000 / MIN_TIME); // steady pace: never a rush
      count.textContent = String(Math.round(shown * 100)).padStart(2, '0');
      draw(shown);
      if (shown >= 1) {
        gsap.ticker.remove(tick);
        resolve();
      }
    };
    gsap.ticker.add(tick);
  });
}

/** Text and notes fade; the 3D shoe appears as an x-ray wireframe over the drawing (canvas above), which hands over to it. */
export function exit() {
  el.classList.add('is-leaving'); // read by scripts/smoke.mjs
  document.documentElement.classList.remove('is-loading');
  if (reduced) return gsap.to(el, { autoAlpha: 0, duration: 0.3 }).then(() => el.remove());
  return gsap
    .timeline()
    .to(el.querySelectorAll('.pl-label, .pl-line, .pl-count'), { opacity: 0, y: 10, duration: 0.5, stagger: 0.05, ease: 'power2.in' }, 0)
    .to(notes, { opacity: 0, duration: 0.4, stagger: 0.04 }, 0)
    .to(drawing, { opacity: 0, duration: 1, ease: 'power1.in' }, 0.5)
    .to(grid, { opacity: 0, duration: 0.8 }, 0.6)
    .to(el, { backgroundColor: 'rgba(237, 242, 235, 0)', duration: 0.4, ease: 'none' }, 1) // --cloud → clear: slide 1, same colour
    .then(() => el.remove());
}
