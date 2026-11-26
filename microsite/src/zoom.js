import gsap from 'gsap';
import { scrollMode, reduced } from './deck.js';

const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Hover a creative to present it: after a short rest it grows to most of the screen over a dark veil, so the
 * presenter can talk it through; moving off it (or any key, or a click on the veil) closes it. The zoomed box
 * always keeps the pointer inside, so the hover holds. `items` are the hover targets; `grow(item)` is the element
 * that is transformed (one GSAP doesn't otherwise move). Deck mode with a mouse only. Returns a cleanup for leave().
 */
export function hoverZoom(slideEl, items, grow, { onOpen } = {}) {
  if (scrollMode || !canHover) return () => {};
  const veil = slideEl.querySelector('.zoom-veil') || slideEl.appendChild(Object.assign(document.createElement('div'), { className: 'zoom-veil' }));
  const header = document.querySelector('.site-header');
  const dur = reduced ? 0.01 : 0.65;
  const ctl = new AbortController();
  const on = (target, type, fn, opts) => target.addEventListener(type, fn, { signal: ctl.signal, ...opts });
  let open = null;
  let timer = 0;
  let px = 0, py = 0;

  const show = (item) => {
    const el = grow(item);
    const keep = el.style.transform;
    el.style.transform = 'none';
    const r = el.getBoundingClientRect();
    el.style.transform = keep;
    const top = header.offsetHeight + 12;
    const room = innerHeight - top - 76; // keeps clear of the presenter bar at the bottom
    const s = Math.min((innerWidth * 0.9) / r.width, room / r.height);
    const W = r.width * s, H = r.height * s, m = 12;
    let X = (innerWidth - W) / 2, Y = top + (room - H) / 2;
    X = Math.min(Math.max(X, px - W + m), px - m); // keep the pointer inside the zoomed box
    Y = Math.min(Math.max(Y, py - H + m), py - m);
    open = { item, el };
    item.classList.add('is-zoomed');
    slideEl.classList.add('is-zoom');
    onOpen?.();
    gsap.to(el, { x: X - r.left, y: Y - r.top, scale: s, transformOrigin: '0 0', duration: dur, ease: 'expo.out', overwrite: true });
  };
  const hide = (instant) => {
    clearTimeout(timer);
    if (!open) return;
    const { item, el } = open;
    open = null;
    slideEl.classList.remove('is-zoom');
    gsap.to(el, { x: 0, y: 0, scale: 1, duration: instant ? 0 : dur * 0.8, ease: 'power3.inOut', overwrite: true,
      onComplete: () => item.classList.remove('is-zoomed') });
  };

  on(window, 'pointermove', (e) => ((px = e.clientX), (py = e.clientY)));
  items.forEach((it) => {
    on(it, 'pointerenter', () => {
      if (open) return;
      clearTimeout(timer);
      timer = setTimeout(() => show(it), 160); // a short rest, so sweeping across doesn't fire zooms
    });
    on(it, 'pointerleave', () => (open?.item === it ? hide() : clearTimeout(timer)));
  });
  on(veil, 'click', () => hide());
  on(window, 'keydown', () => hide(true), { capture: true });
  return () => (ctl.abort(), hide(true));
}
