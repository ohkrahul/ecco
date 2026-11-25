import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { slide } from '../deck.js';

/** 7 · The zone: Category, Brand and Consumer slide together; the overlap is "Understated by Choice". Click → manifesto. */
export function init() {
  slide('zone', (tl, el) => {
    const circles = ['.zc-cat', '.zc-brand', '.zc-con'].map((s) => el.querySelector(s));
    const core = el.querySelector('.zone-core');
    const man = el.querySelector('.zone-manifesto');
    const size = circles[0].offsetWidth;
    // In circle widths from the centre: start in a row, end in an overlapping triangle; labels move out of the overlap.
    const startX = [-1.12, 0, 1.12];
    const end = [[-0.3, 0.17], [0, -0.2], [0.3, 0.17]];
    const out = [[-0.16, 0.16], [0, -0.2], [0.16, 0.16]];
    const { words } = SplitText.create(man.querySelector('.manifesto-text'), { type: 'words' });
    gsap.set([...circles, core], { xPercent: -50, yPercent: -50 });

    tl.from(el.querySelector('.zone-title'), { opacity: 0, y: 20, duration: 0.8 }, 0);
    circles.forEach((c, i) => {
      tl.from(c, { opacity: 0, scale: 0.8, duration: 0.7, ease: 'power3.out' }, 0.1 + i * 0.12)
        .fromTo(c, { x: startX[i] * size, y: 0 }, { x: end[i][0] * size, y: end[i][1] * size, duration: 1.4, ease: 'power3.inOut' }, 1)
        .to(c.querySelector('b'), { x: out[i][0] * size, y: out[i][1] * size, duration: 1, ease: 'power2.inOut' }, 1.5);
    });
    tl.to(el.querySelectorAll('.zc span'), { opacity: 0, duration: 0.4 }, 1.3)
      .from(core, { autoAlpha: 0, scale: 0.85, duration: 0.8, ease: 'power3.out' }, 2.2)
      .addLabel('manifesto', 3);
    // The diagram shrinks into the left half and the manifesto takes the right.
    const k = 0.72;
    const shift = innerWidth * 0.25;
    circles.forEach((c, i) => tl.to(c, { x: end[i][0] * size * k - shift, y: end[i][1] * size * k, scale: k, duration: 1.1, ease: 'power3.inOut' }, 'manifesto'));
    tl.to(core, { x: -shift, scale: k, duration: 1.1, ease: 'power3.inOut' }, 'manifesto')
      .fromTo(man, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, immediateRender: false }, 'manifesto+=0.5')
      .fromTo(words, { opacity: 0.14 }, { opacity: 1, stagger: 0.08, duration: 0.4, ease: 'none' }, 'manifesto+=0.6')
      .from(man.querySelector('.manifesto-sub'), { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '>-0.2');
  });
}
