import gsap from 'gsap';
import { slide, reduced } from '../deck.js';
import { placeFootprints } from '../footprints.js';
import { hoverZoom } from '../zoom.js';

/**
 * Entrances for the simpler slides. Every [data-reveal] element already rises in (deck.js);
 * these add each slide's own moment.
 */
export function init() {
  // 2 · one idea reaches every channel: spokes draw out from the core, channels light up (digital first)
  slide('objective', (tl, el) => {
    tl.from(el.querySelector('.hub-core'), { scale: 0, duration: 1, ease: 'back.out(1.6)' }, 0.3)
      .from(el.querySelectorAll('.spoke i'), { scaleX: 0, duration: 0.7, ease: 'power2.out', stagger: 0.09 }, 0.7)
      .from(el.querySelectorAll('.node b'), { scale: 0.6, opacity: 0, duration: 0.7, ease: 'back.out(1.8)', stagger: 0.09 }, 0.95);
  });

  // 3 · recognise → understand → experience, then the audience: core buyers first, then ECCO reaches younger
  slide('expectation', (tl, el) => {
    const [acq, core] = el.querySelectorAll('.band');
    tl.from(el.querySelectorAll('.aware li'), { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.2 }, 0.5)
      .from(el.querySelector('.gen-title'), { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out' }, 1.3)
      .from(core, { scaleX: 0, duration: 1.1, ease: 'expo.out' }, 1.5)
      .from(core.children, { opacity: 0, y: 10, duration: 0.5, stagger: 0.08 }, 1.9)
      .from(acq, { scaleX: 0, duration: 1.1, ease: 'expo.out' }, 2.1)
      .from(acq.children, { opacity: 0, y: 10, duration: 0.5, stagger: 0.08 }, 2.5);
  });

  // 5 · the ad card slides in and its posters drop into place
  slide('brand', (tl, el) => {
    tl.from(el.querySelector('.brand-ads'), { x: 80, opacity: 0, duration: 1.3, ease: 'expo.out' }, 0.2)
      .from(el.querySelectorAll('.brand-ads figure'), { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 }, 0.5);
  });

  // 6 · 40% / 55% count up
  slide('audience', (tl, el) => {
    el.querySelectorAll('.stat').forEach((s) => {
      const n = { v: 0 };
      s.textContent = '0';
      tl.to(n, { v: +s.dataset.count, duration: 1.6, ease: 'power2.out', onUpdate: () => (s.textContent = Math.round(n.v)) }, 0.6);
    });
  });

  // 8 / 15 · route openers: the big outlined R1 / R2 slides in
  for (const id of ['route-01', 'route-02']) {
    slide(id, (tl, el) => {
      tl.from(el.querySelector('.chapter-num'), { xPercent: 25, opacity: 0, duration: 1.8, ease: 'expo.out' }, 0);
    });
  }

  // 9 · key visuals wipe open; hover one to open it up
  slide('kvs', (tl, el) => {
    tl.fromTo(el.querySelectorAll('.kv-grid .frame'), { clipPath: 'inset(0% 100% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.2, ease: 'power3.inOut', stagger: 0.15 }, 0.2)
      .from(el.querySelectorAll('.kv-grid img'), { scale: 1.2, duration: 1.8, ease: 'power2.out', stagger: 0.15 }, 0.2);
    return hoverZoom(el, [...el.querySelectorAll('.kv-grid figure')], (f) => f.querySelector('.frame'));
  });

  // 11 · the phone cards fan in, then each "Posted" gets struck out
  slide('unposted', (tl, el) => {
    const cards = [...el.querySelectorAll('.up-card')];
    cards.forEach((c) => c.classList.remove('is-struck'));
    tl.from(cards, { y: 160, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.12 }, 0.3);
    cards.forEach((c, i) => tl.call(() => c.classList.add('is-struck'), null, 1.4 + i * 0.25));
  });

  // 13 · a camera flash as each name is "spotted"
  slide('spotted', (tl, el) => {
    const flash = el.querySelector('.flash');
    el.querySelectorAll('.name-col li').forEach((li, i) => {
      const at = 0.9 + i * 0.16;
      tl.fromTo(flash, { opacity: 0.5 }, { opacity: 0, duration: 0.35, ease: 'power2.out', immediateRender: false }, at)
        .from(li, { opacity: 0, y: 14, duration: 0.4, ease: 'power3.out' }, at);
    });
  });

  // 16 · a moving walkway that arrives fast and slows to a crawl
  const belt = document.querySelector('#not-in-ecco .wk-track');
  belt.append(...[...belt.children].map((n) => Object.assign(n.cloneNode(true), { ariaHidden: 'true' })));
  slide('not-in-ecco', (tl, el) => {
    const rail = el.querySelector('.wk-rail');
    tl.fromTo(el.querySelector('.wk-head mark'), { backgroundSize: '0% 0.42em' }, { backgroundSize: '100% 0.42em', duration: 0.9, ease: 'power2.inOut' }, 0.7)
      .from(el.querySelector('.wk-belt'), { xPercent: 40, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.2)
      .from(rail, { scaleX: 0, transformOrigin: '0 50%', duration: 1.4, ease: 'expo.out' }, 0.3);
    // Hover a creative: the belt stops dead and the creative opens up over a veil (zoom.js).
    let move = null;
    const zoomOff = hoverZoom(el, [...el.querySelectorAll('.wk-item')], (item) => item, { onOpen: () => move && gsap.to(move, { timeScale: 0, duration: 0.2, overwrite: true }) });
    if (reduced) return zoomOff;
    const period = belt.scrollWidth / 2;
    const crawl = period / 90; // seconds per loop at 90 px/s
    move = gsap.timeline({ repeat: -1 })
      .fromTo(belt, { x: 0 }, { x: -period, duration: crawl, ease: 'none' }, 0)
      .fromTo(rail, { backgroundPositionX: 0 }, { backgroundPositionX: -period, duration: crawl, ease: 'none' }, 0);
    gsap.from(move, { timeScale: 10, duration: 2.6, ease: 'power2.out' });
    // Pointer on the belt: it eases to a stop so a creative can be picked; off → it walks on.
    const hold = () => gsap.to(move, { timeScale: 0, duration: 0.5, ease: 'power2.out', overwrite: true });
    const walk = () => gsap.to(move, { timeScale: 1, duration: 0.8, ease: 'power2.in', overwrite: true });
    const area = el.querySelector('.wk-belt');
    area.addEventListener('pointerenter', hold);
    area.addEventListener('pointerleave', walk);
    return () => (zoomOff(), area.removeEventListener('pointerenter', hold), area.removeEventListener('pointerleave', walk));
  });

  // 17 · footprints walk out through the jam
  const jam = document.querySelector('#traffic .jam-steps');
  const prints = placeFootprints(jam.querySelector('path'), jam.querySelector('g'), 20, { stride: 16 }).map((p) => p.el);
  slide('traffic', (tl, el) => {
    tl.from(el.querySelector('.jam'), { y: 40, opacity: 0, duration: 1, ease: 'power3.out' }, 0.3)
      .from(prints, { opacity: 0, duration: 0.1, stagger: 0.12, ease: 'none' }, 1);
  });
}
