import { slide } from '../deck.js';
import { placeFootprints } from '../footprints.js';

const WALK = 0.6; // when the footprints set off
const STEP = 1; // seconds per phase

/** Campaign-flow slides: footprints walk across the five phases; each lights up as the walk reaches it. */
export function init() {
  for (const id of ['flow-01', 'flow-02']) {
    const svg = document.querySelector(`#${id} .flow-steps`);
    const prints = placeFootprints(svg.querySelector('path'), svg.querySelector('g'), 34, { stride: 7 }).map((p) => p.el);

    slide(id, (tl, el) => {
      const phases = [...el.querySelectorAll('.phase')];
      const mark = (i) => phases.forEach((ph, j) => ph.classList.toggle('is-current', j === i));
      mark(-1);
      tl.from(el.querySelectorAll('.flow-head > *'), { y: 30, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' }, 0)
        .from(prints, { opacity: 0, duration: 0.05, stagger: (phases.length * STEP) / prints.length, ease: 'none' }, WALK);
      phases.forEach((ph, i) => tl.from(ph, { opacity: 0.18, y: 30, duration: 0.7, ease: 'power3.out' }, WALK + i * STEP));
      // The phase the walk has most recently reached is "current"; once the walk is done, none is.
      tl.eventCallback('onUpdate', () => {
        const t = tl.time() - WALK;
        mark(t < 0 || tl.time() > tl.duration() - 0.01 ? -1 : Math.floor(t / STEP));
      });
    });
  }
}
