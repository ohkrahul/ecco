import gsap from 'gsap';
import { slide, reduced } from '../deck.js';
import { placeFootprints } from '../footprints.js';

/**
 * Entrances for the simpler slides. Every [data-reveal] element already rises in (deck.js);
 * these add each slide's own moment.
 */
export function init() {
  const random = gsap.utils.random;

  // 2 · the channels arrive scattered, then line up as one idea; the age bands grow along the axis
  slide('brief', (tl, el) => {
    tl.from(el.querySelectorAll('.channels li'), { x: () => random(-320, 320), y: () => random(-180, 180), rotation: () => random(-25, 25), opacity: 0, duration: 1.5, ease: 'expo.out', stagger: 0.06 }, 0.4)
      .from(el.querySelectorAll('.age-band'), { scaleX: 0, duration: 1.4, ease: 'expo.out', stagger: 0.25 }, 1);
  });

  // 3 · ECCO's products line up on the shelf
  slide('brand', (tl, el) => {
    tl.from(el.querySelectorAll('.shelf figure'), { y: 60, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out' }, 0.7);
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

  // 9 · key visuals wipe open
  slide('kvs', (tl, el) => {
    tl.fromTo(el.querySelectorAll('.kv-grid .frame'), { clipPath: 'inset(0% 100% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.2, ease: 'power3.inOut', stagger: 0.15 }, 0.2)
      .from(el.querySelectorAll('.kv-grid img'), { scale: 1.2, duration: 1.8, ease: 'power2.out', stagger: 0.15 }, 0.2);
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
    tl.from(el.querySelector('.wk-belt'), { xPercent: 40, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.2)
      .from(rail, { scaleX: 0, transformOrigin: '0 50%', duration: 1.4, ease: 'expo.out' }, 0.3);
    if (reduced) return;
    const period = belt.scrollWidth / 2;
    const crawl = period / 40; // seconds per loop at 40 px/s
    const move = gsap.timeline({ repeat: -1 })
      .fromTo(belt, { x: 0 }, { x: -period, duration: crawl, ease: 'none' }, 0)
      .fromTo(rail, { backgroundPositionX: 0 }, { backgroundPositionX: -period, duration: crawl, ease: 'none' }, 0);
    gsap.from(move, { timeScale: 10, duration: 2.6, ease: 'power2.out' });
  });

  // 17 · footprints walk out through the jam
  const jam = document.querySelector('#traffic .jam-steps');
  const prints = placeFootprints(jam.querySelector('path'), jam.querySelector('g'), 20, { stride: 16 }).map((p) => p.el);
  slide('traffic', (tl, el) => {
    tl.from(el.querySelector('.jam'), { y: 40, opacity: 0, duration: 1, ease: 'power3.out' }, 0.3)
      .from(prints, { opacity: 0, duration: 0.1, stagger: 0.12, ease: 'none' }, 1);
  });
}
