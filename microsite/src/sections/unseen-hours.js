import gsap from 'gsap';
import { slide, reduced } from '../deck.js';

const HOLD = 1.7; // seconds per caption

/** 10 · The Unseen Hours: the film opens up and its day plays on a loop. Click → the end frame. */
export function init() {
  const section = document.getElementById('unseen-hours');
  const videos = [...section.querySelectorAll('.uh-media video')];

  slide('unseen-hours', (tl, el) => {
    const media = el.querySelector('.uh-media');
    const film = el.querySelector('.uh-film');
    const counter = el.querySelector('.uh-counter');
    const hours = el.querySelector('.uh-hours');
    const captions = [...el.querySelectorAll('.uh-captions li')];
    const end = el.querySelector('.uh-end');

    // Only the clip that matches the caption plays.
    const show = (i) => videos.forEach((v, j) => {
      v.classList.toggle('is-active', j === i);
      if (j === i && !reduced) v.play().catch(() => {});
      else v.pause();
    });
    show(0);

    tl.fromTo(media, { clipPath: 'inset(22% 28% 22% 28% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.4, ease: 'power3.inOut' }, 0)
      .from(film.querySelectorAll('.label, h2, .uh-tagline'), { y: 40, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out' }, 0.6)
      .from(counter, { opacity: 0, duration: 0.6 }, 1.2)
      .addLabel('end', 2.2)
      .to(media, { opacity: 0.25, duration: 0.8 }, 'end')
      .to([film, counter], { autoAlpha: 0, duration: 0.6 }, 'end')
      .fromTo(end, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power2.out', immediateRender: false }, 'end+=0.4')
      .from(end.querySelectorAll('.uh-end-copy > *'), { y: 30, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }, 'end+=0.5')
      .from(end.querySelector('.uh-poster'), { x: 60, opacity: 0, duration: 1.2, ease: 'expo.out' }, 'end+=0.5');

    if (reduced) {
      gsap.set(captions[0], { opacity: 1 });
      hours.textContent = (10000).toLocaleString('en-IN');
    } else {
      // A day on a loop: caption → matching clip; the hours count up once.
      const loop = gsap.timeline({ repeat: -1, delay: 1.2 });
      captions.forEach((c, i) => {
        loop.call(() => show(i % videos.length), null, i * HOLD)
          .fromTo(c, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, i * HOLD)
          .to(c, { opacity: 0, y: -30, duration: 0.4 }, (i + 1) * HOLD - 0.4);
      });
      const n = { v: 0 };
      hours.textContent = '0';
      gsap.to(n, { v: 10000, duration: captions.length * HOLD, delay: 1.2, ease: 'power1.inOut', onUpdate: () => (hours.textContent = Math.round(n.v).toLocaleString('en-IN')) });
    }
    return () => videos.forEach((v) => v.pause());
  });

  // Full-screen film player (placeholder clip until the Veo film lands).
  const dialog = section.querySelector('.film-dialog');
  const film = dialog.querySelector('video');
  const playBtn = section.querySelector('.uh-play');
  playBtn.addEventListener('click', () => {
    videos.forEach((v) => v.pause());
    dialog.showModal();
    film.currentTime = 0;
    film.play().catch(() => {});
  });
  dialog.querySelector('.film-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    film.pause();
    requestAnimationFrame(() => playBtn.blur()); // so Space/Enter on the clicker moves on instead of replaying
  });
}
