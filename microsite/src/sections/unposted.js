import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mm, MOTION, REDUCED } from '../scroll.js';

export function init() {
  const section = document.getElementById('unposted');
  const cards = [...section.querySelectorAll('.up-card')];

  mm.add({ motion: MOTION, small: '(max-width: 860px)' }, (ctx) => {
    if (!ctx.conditions.motion) return;
    const drift = ctx.conditions.small ? 40 : 170;
    cards.forEach((card) => {
      const speed = parseFloat(card.dataset.speed || '1');
      gsap.fromTo(card, { y: drift * speed }, {
        y: -drift * speed,
        ease: 'none',
        scrollTrigger: { trigger: section.querySelector('.up-cards'), start: 'top bottom', end: 'bottom top', scrub: true },
      });
      ScrollTrigger.create({ trigger: card, start: 'top 72%', onEnter: () => card.classList.add('is-struck') });
    });
  });

  mm.add(REDUCED, () => cards.forEach((c) => c.classList.add('is-struck')));
}
