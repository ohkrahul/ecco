import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { mm, MOTION } from '../scroll.js';

/** Shared entrances: [data-split] headings, [data-reveal] blocks, chapter lines, bento tiles. */
export function init() {
  mm.add(MOTION, () => {
    gsap.utils.toArray('[data-split]').forEach((el) =>
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, { yPercent: 105, duration: 1.3, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 86%' } }),
      }),
    );
    gsap.utils.toArray('[data-reveal]').forEach((el) =>
      gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }),
    );
    gsap.utils.toArray('.chapter-line').forEach((el) =>
      gsap.from(el, { scaleX: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } }),
    );
    gsap.utils.toArray('.chip').forEach((el) =>
      gsap.from(el, { opacity: 0, y: 16, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }),
    );
    gsap.utils.toArray('.bento').forEach((b) =>
      gsap.from(b.querySelectorAll('.tile'), { y: 90, opacity: 0, duration: 1.2, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: b, start: 'top 82%' } }),
    );
  });
}
