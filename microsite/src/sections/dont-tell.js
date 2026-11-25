import gsap from 'gsap';
import { mm, MOTION } from '../scroll.js';

export function init() {
  const section = document.getElementById('dont-tell');
  const track = section.querySelector('.dt-track');

  mm.add(MOTION, () => {
    const distance = () => track.scrollWidth - innerWidth;
    const scroll = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 1, invalidateOnRefresh: true },
    });

    section.querySelectorAll('.dt-kv').forEach((kv) => {
      gsap.timeline({ scrollTrigger: { trigger: kv, containerAnimation: scroll, start: 'left 92%', end: 'left 30%', scrub: true } })
        .fromTo(kv.querySelector('.frame'), { clipPath: 'inset(0% 100% 0% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', ease: 'power1.inOut' }, 0)
        .fromTo(kv.querySelector('img'), { scale: 1.2 }, { scale: 1, ease: 'none' }, 0)
        .from(kv.querySelector('figcaption'), { opacity: 0, y: 14, duration: 0.3 }, 0.65);
    });

    section.querySelectorAll('.dt-type').forEach((panel) => {
      const [a, b] = panel.querySelectorAll('p');
      gsap.timeline({ scrollTrigger: { trigger: panel, containerAnimation: scroll, start: 'left 85%', end: 'left 40%', scrub: true } })
        .from(a, { yPercent: 50, opacity: 0, ease: 'none' }, 0)
        .from(b, { yPercent: 50, opacity: 0, ease: 'none' }, 0.45);
    });
  });
}
