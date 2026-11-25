import gsap from 'gsap';
import { reduced } from '../deck.js';

const el = document.getElementById('preloader');

/** Counts 00→100 against real progress. Resolves when `ready` settles (min 1.2 s, max `cap` ms). */
export function load({ ready, progress, cap = 6000 }) {
  const count = el.querySelector('.pl-count');
  const line = el.querySelector('.pl-line');
  let done = false;
  const minTime = new Promise((r) => setTimeout(r, reduced ? 0 : 1200));
  Promise.race([Promise.allSettled([ready, minTime]), new Promise((r) => setTimeout(r, cap))]).then(() => (done = true));

  return new Promise((resolve) => {
    let shown = 0;
    const tick = () => {
      const target = done ? 1 : Math.min(progress(), 1) * 0.9;
      shown += (target - shown) * (done ? 0.2 : 0.07);
      if (done && 1 - shown < 0.004) shown = 1;
      count.textContent = String(Math.round(shown * 100)).padStart(2, '0');
      line.style.transform = `scaleX(${shown})`;
      if (shown === 1) {
        gsap.ticker.remove(tick);
        resolve();
      }
    };
    gsap.ticker.add(tick);
  });
}

/** The line becomes "—— WALK YOUR WALK.", then the screen splits open. */
export function exit() {
  if (reduced) return gsap.to(el, { autoAlpha: 0, duration: 0.3 }).then(() => el.remove());
  const line = el.querySelector('.pl-line');
  const label = el.querySelector('.pl-label');
  const mark = label.querySelector('.line-mark');
  const markRect = mark.getBoundingClientRect();
  return gsap
    .timeline({ defaults: { ease: 'expo.inOut' } })
    .to(el.querySelector('.pl-count'), { yPercent: 40, opacity: 0, duration: 0.6, ease: 'power3.in' }, 0)
    .to(line, { scaleX: markRect.width / innerWidth, x: markRect.left, y: markRect.top + markRect.height / 2 - innerHeight / 2, duration: 1.0 }, 0.1)
    .to(label, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.75)
    .to([line, label], { opacity: 0, duration: 0.4, ease: 'power2.in' }, 1.5)
    .to(el.querySelector('.pl-top'), { yPercent: -100, duration: 1.1 }, 1.65)
    .to(el.querySelector('.pl-bottom'), { yPercent: 100, duration: 1.1 }, 1.65)
    .then(() => el.remove());
}
