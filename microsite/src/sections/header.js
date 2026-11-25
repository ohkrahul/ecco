import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { goToSection } from '../present.js';

const CHAPTERS = [
  { from: '#brief', to: '#expectation', text: 'The brief' },
  { from: '#brand', to: '#audience', text: 'Brand · Category · Audience' },
  { from: '#zone', to: '#zone', text: 'The idea — Understated by Choice' },
  { from: '#route-01', to: '#flow-01', text: 'Route 01 — Don’t tell them' },
  { from: '#route-02', to: '#flow-02', text: 'Route 02 — For those not in ECCO' },
  { from: '#owners', to: '#owners', text: 'Owners’ Club' },
  { from: '#compare', to: '#compare', text: 'Two routes, one brief' },
];

export function init({ lenis }) {
  const header = document.getElementById('site-header');
  const progress = header.querySelector('.progress');
  const label = header.querySelector('.chapter-label');
  const nav = header.querySelector('.nav');
  const menuBtn = header.querySelector('.menu-btn');

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      progress.style.transform = `scaleX(${self.progress})`;
      header.classList.toggle('is-solid', y > 40);
      header.classList.toggle('is-hidden', self.direction === 1 && y > 240 && !nav.classList.contains('is-open'));
    },
  });

  const triggers = CHAPTERS.map((c) =>
    ScrollTrigger.create({ trigger: c.from, start: 'top 45%', endTrigger: c.to, end: 'bottom 45%', onToggle: updateChapter }),
  );
  function updateChapter() {
    const i = triggers.findIndex((t) => t.isActive);
    header.classList.toggle('has-chapter', i >= 0);
    if (i >= 0) label.textContent = CHAPTERS[i].text;
  }

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    open ? lenis?.stop() : lenis?.start();
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  addEventListener('keydown', (e) => e.key === 'Escape' && nav.classList.contains('is-open') && setMenu(false));
  matchMedia('(min-width: 861px)').addEventListener('change', (e) => e.matches && nav.classList.contains('is-open') && setMenu(false));

  // In-page links glide to the section's first slide stop; placeholder "#" links do nothing in the pitch build.
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const hash = a.getAttribute('href');
      if (hash.length < 2) return;
      if (nav.classList.contains('is-open')) setMenu(false);
      goToSection(hash);
    }),
  );
}
