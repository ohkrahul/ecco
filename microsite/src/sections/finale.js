import { slide } from '../deck.js';

/** 23 · Thank you: the shoe settles back in under the title. */
export function init({ stage }) {
  slide('finale', (tl, el) => {
    const pose = stage?.show('finale', { rotY: -0.55, rotX: 0.28, y: 0.08 }, el.querySelector('.shoe-slot'));
    tl.from(el.querySelector('.finale-title'), { yPercent: 30, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0)
      .from(el.querySelectorAll('.finale-ctas > *, .credits'), { y: 24, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }, 0.6);
    if (pose) tl.from(pose, { visible: 0, rotY: -2.7, y: -0.9, scale: 0.9, duration: 2, ease: 'expo.out' }, 0.2);
    return () => stage?.hide('finale');
  });
}
