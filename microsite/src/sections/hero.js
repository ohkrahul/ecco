import { SplitText } from 'gsap/SplitText';
import { slide } from '../deck.js';

/** 1 · Opening: the 3D shoe appears as an x-ray wireframe (over the loading screen's drawing on first load), the scan
 *  turns it into leather, then the title rises and the shoe starts to sway. */
export function init({ stage }) {
  slide('top', (tl, el) => {
    const pose = stage?.show('top', { y: -0.18 });
    const { chars } = SplitText.create(el.querySelector('.hero-title'), { type: 'words,chars' });
    if (pose) {
      tl.from(pose, { visible: 0, duration: 0.6 }, 0)
        .from(pose, { sweep: 1, duration: 1.8, ease: 'power2.inOut' }, 0.6)
        .to(pose, { xray: 1, duration: 0.3 }, 0.55) // the scan line glows only while it moves
        .to(pose, { xray: 0, duration: 0.4 }, 1.95) // out as the cut clears the heel
        .from(pose, { idle: 0, duration: 1.2 }, 2.6); // still while it matches the drawing, then the sway starts
    }
    tl.from(chars, { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.04 }, 1.4)
      .from(el.querySelectorAll('.above-stage'), { opacity: 0, y: 16, duration: 1, ease: 'power3.out', stagger: 0.2 }, 1.85);
    return () => stage?.hide('top');
  });
}
