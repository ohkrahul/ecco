import gsap from 'gsap';
import { slide } from '../deck.js';

/** 5 · The category: competitor campaigns pile up and get loud. Click → everything goes quiet: "And ECCO?" */
export function init() {
  slide('category', (tl, el) => {
    const cards = [...el.querySelectorAll('.cat-card')];
    const head = el.querySelector('.wall-head');
    const quiet = el.querySelector('.wall-quiet');
    cards.forEach((c) => gsap.set(c, { rotation: parseFloat(c.style.getPropertyValue('--r')) || 0 }));

    tl.from(head.children, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1 }, 0);
    cards.forEach((c, i) => tl.from(c, { opacity: 0, scale: 0.6, y: 140, duration: 0.9, ease: 'back.out(1.4)' }, 0.3 + i * 0.16));
    // The noise: the full wall jitters (odd repeat + yoyo ends where it started).
    tl.to(cards, { x: () => gsap.utils.random(-14, 14), y: () => gsap.utils.random(-10, 10), duration: 0.06, repeat: 9, yoyo: true, ease: 'none' }, 2)
      .addLabel('and-ecco', 2.8)
      .to(cards, { opacity: 0.1, scale: 0.94, filter: 'blur(6px)', duration: 1, ease: 'power2.inOut' }, 'and-ecco')
      .to(head, { opacity: 0.15, duration: 0.8 }, 'and-ecco')
      .to(quiet, { autoAlpha: 1, duration: 0.6 }, 'and-ecco+=0.6')
      .from(quiet.children, { y: 30, opacity: 0, stagger: 0.2, duration: 1, ease: 'power3.out' }, 'and-ecco+=0.6');
  });
}
