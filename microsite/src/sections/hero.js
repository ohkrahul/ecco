import { SplitText } from 'gsap/SplitText';
import { slide } from '../deck.js';

/** 1 · Opening: the title rises letter by letter while the 3D shoe swings in. */
export function init({ stage }) {
  slide('top', (tl, el) => {
    const pose = stage?.show('top', { y: -0.18 });
    const { chars } = SplitText.create(el.querySelector('.hero-title'), { type: 'words,chars' });
    tl.from(chars, { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.04 }, 0)
      .from(el.querySelectorAll('.above-stage'), { opacity: 0, y: 16, duration: 1, ease: 'power3.out', stagger: 0.2 }, 0.6);
    if (pose) tl.from(pose, { visible: 0, y: -0.9, rotY: -2.2, duration: 2, ease: 'expo.out' }, 0.2);
    return () => stage?.hide('top');
  });
}
