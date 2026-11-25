import gsap from 'gsap';
import { mm, MOTION } from '../scroll.js';

/** A "moving walkway" belt that speeds up with scroll velocity, then eases back to a crawl. */
export function init({ lenis }) {
  const section = document.getElementById('not-in-ecco');
  const track = section.querySelector('.wk-track');
  const rail = section.querySelector('.wk-rail');

  mm.add(MOTION, () => {
    const clones = [...track.children].map((n) => {
      const c = n.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      return c;
    });
    track.append(...clones);

    let x = 0;
    let speed = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(section);
    const tick = (_time, deltaMs) => {
      if (!visible) return;
      const target = 0.7 + Math.min(Math.abs(lenis?.velocity || 0) * 0.45, 24);
      speed += (target - speed) * 0.07;
      x -= speed * (deltaMs / 16.67);
      const period = track.scrollWidth / 2;
      if (period > 0) x %= period;
      track.style.transform = `translate3d(${x}px,0,0)`;
      rail.style.backgroundPositionX = `${x}px`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      clones.forEach((c) => c.remove());
      track.style.transform = '';
    };
  });
}
