import gsap from 'gsap';
import { slide, scrollMode } from '../deck.js';
import { placeFootprints } from '../footprints.js';

const STOP_AT = [0.12, 0.3, 0.5, 0.68, 0.86]; // positions along the path
const WALK = 0.5; // when the walk starts
const LEN = 4; // seconds the walk takes

/** 18 · One pair. Every plan: footprints cross the screen; each stop of the trip appears as the walk reaches it. */
export function init() {
  const section = document.getElementById('one-pair');
  const svg = section.querySelector('.op-svg');
  const path = svg.querySelector('.op-path');
  const prints = placeFootprints(path, svg.querySelector('.op-steps'), 30);

  slide('one-pair', (tl, el) => {
    const stops = [...el.querySelectorAll('.op-stop')];
    // Hang each photo on its point of the path (viewBox 1600×900, "meet"), above or below — whichever side has room.
    // (Scroll mode: the photos sit in a grid instead.)
    const w = el.clientWidth;
    const h = el.clientHeight;
    const k = Math.min(w / 1600, h / 900);
    const length = path.getTotalLength();
    if (!scrollMode) stops.forEach((stop, i) => {
      const pt = path.getPointAtLength(STOP_AT[i] * length);
      const half = stop.offsetWidth / 2 + 12;
      const x = gsap.utils.clamp(half, w - half, (w - 1600 * k) / 2 + pt.x * k);
      const y = (h - 900 * k) / 2 + pt.y * k;
      gsap.set(stop, { left: x, top: y, xPercent: -50, yPercent: y > h * 0.5 ? -108 : 10 });
    });

    tl.from(el.querySelectorAll('.op-head > *'), { y: 40, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' }, 0);
    prints.forEach((p) => tl.from(p.el, { opacity: 0, duration: 0.1 }, WALK + p.t * LEN));
    stops.forEach((s, i) => tl.from(s, { opacity: 0, scale: 0.9, duration: 0.6, ease: 'back.out(1.6)' }, WALK + STOP_AT[i] * LEN));
    tl.from(el.querySelector('.op-product'), { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out' }, WALK + LEN);
  });
}
