import { slide } from '../deck.js';

/** 4 · Key USPs: an x-ray scan runs heel → toe across the 3D shoe and back; the five USPs appear as it passes. */
export function init({ stage }) {
  slide('shoe', (tl, el) => {
    // Side profile (rotY ≈ 0) so the cut travels heel → toe.
    const pose = stage?.show('shoe', { idle: 0, rotX: 0.14, rotY: -0.32, scale: 1.1, y: 0.02 });
    tl.from(el.querySelectorAll('.craft-head > *'), { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0);
    if (pose) {
      tl.from(pose, { visible: 0, duration: 0.6 }, 0)
        .to(pose, { rotY: 0.32, duration: 5.6, ease: 'sine.inOut' }, 0)
        .to(pose, { xray: 1, duration: 0.4 }, 0.5)
        .to(pose, { sweep: 1, duration: 3.2, ease: 'power1.inOut' }, 0.6)
        .to(pose, { sweep: 0, duration: 1.4, ease: 'power2.inOut' }, 4)
        .to(pose, { xray: 0, duration: 0.4 }, 5.2)
        .to(pose, { idle: 1, duration: 1.2 }, 5.4);
    }
    el.querySelectorAll('.callout').forEach((c, i) => {
      const at = 0.9 + i * 0.55;
      tl.from(c.querySelector('.leader'), { scaleX: 0, duration: 0.5, ease: 'power2.out' }, at)
        .from(c.querySelectorAll('.num, strong, .desc'), { y: 14, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out' }, at + 0.15);
    });
    return () => stage?.hide('shoe');
  });
}
