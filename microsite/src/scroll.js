import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const MOTION = '(prefers-reduced-motion: no-preference)';
export const REDUCED = '(prefers-reduced-motion: reduce)';
export const reduced = matchMedia(REDUCED).matches;
export const mm = gsap.matchMedia();

/** Smooth scroll. Returns { lenis } (null when reduced motion). Keyboard/clicker stepping lives in present.js. */
export function initScroll() {
  if (reduced) {
    document.documentElement.classList.add('reduced');
    return { lenis: null };
  }
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return { lenis };
}
