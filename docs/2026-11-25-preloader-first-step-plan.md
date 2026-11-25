# Loading screen "First step" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (the user asked for it to be built
> locally right away). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the counter/split preloader with footprints that walk in while the site loads, then the 3D shoe is
lowered onto the last steps and slide 1's title rises.

**Architecture:** `preloader.js` owns the walk (progress → footprints) and the exit (fade text + background, fade
prints). The landing is slide 1's own entrance in `hero.js` (pose drops from above), timed by `deck.start(delay)` in
`main.js`. `stage.js` gains a `ground` pose value so the floor/shadow stays put while the shoe descends.

**Tech Stack:** Vite, GSAP, Three.js (existing). No new dependencies.

**Spec:** `docs/2026-11-25-preloader-first-step-design.md`

## Global Constraints

- Copy: top-left `ECCO India · Walk Your Walk`; bottom-left *Every launch starts with one step.*; bottom-right counter 00→100.
- Preloader background = slide 1's colour (`--cloud`), so the hand-off has no visible cut.
- Walk pace never faster than ~2.4 s for the whole trail; slower if loading is slower; hard cap stays 6 s of loading.
- Time from load to title ≈ today (~4 s). Reduced motion: no walk, short fade. `?nowebgl`: walk, then still image.
- Local only. No push until the user says so.

## Review Focus

- Slow network (Vercel, 7.5 MB model): the walk must keep moving with real progress and not stall at the last print — smoke screenshot mid-walk on the local server is the floor; check live after a push.
- F5 / Home after the intro: Home replays the landing with no footprints and no preloader leftovers (preloader element removed) — smoke `go(0)` + `checkSlide`.
- Window resized during loading: footprints are laid out once for the load-time size; they fade before slide 1, so no fix needed — noted, not tested.
- WebGL missing: exit must not wait on a shoe that never drops — `?nowebgl` smoke run.
- Reduced motion: no walk; `#preloader` gone within the existing 12 s check — existing reduced-motion run.

---

### Task 1: The landing (stage `ground` + hero drop)

**Files:** Modify `microsite/src/stage.js` (basePose, render), `microsite/src/sections/hero.js`, `microsite/src/main.js`

**Interfaces:** Produces pose value `ground: number | null` (absolute floor y; `null` = follow the shoe, as today).
`deck.start(delay)` delay becomes the moment the background has gone (≈ 0.35 s into the preloader exit).

- [ ] `basePose()` gets `ground: null`; render uses `floor.position.y = p.ground ?? p.y - 0.62 * p.scale`.
- [ ] Hero: pose `{ y: -0.18, ground: -0.18 - 0.62 }`; entrance `from(pose, { y: 2.4, rotY: -1.5, rotX: 0.65, duration: 1.5, ease: 'power3.out' }, 0)`; title chars at 0.55, `.above-stage` at 1.0.
- [ ] Verify: `npm run build`; smoke `checkSlide` still shows the shoe on `#top` (canvas opacity ≥ 0.5).

### Task 2: The walk + exit

**Files:** Modify `microsite/index.html` (preloader markup), `microsite/src/sections/preloader.js`, `microsite/src/styles/deck.css` (preloader block), `microsite/scripts/smoke.mjs`

**Interfaces:** `load({ ready, progress, cap })` unchanged signature; `exit()` returns a promise, resolves after the preloader is removed (≈ 1.7 s).

- [ ] Markup: `.pl-label`, `svg.pl-steps > path + g`, `.pl-line` (serif italic copy), `.pl-count`. Remove halves/line.
- [ ] Walk: 12 prints via `placeFootprints` on a path from off-screen left (≈ 0.88 h) to the centre (0.5 w, ≈ 0.76 h); SVG viewBox = window size / 1.6 so prints read at ~1.6×. `shown` advances by at most `dt / 2.4 s`, toward `progress × 0.92` (1 once ready); print *i* fades in when `shown ≥ (i+1)/12`; print *i−4* dims to 0.3.
- [ ] Exit: text + counter fade (0–0.5 s), background `--cloud` → transparent (0.3–0.9 s), prints fade from the first (0.5 s, 0.06 s apart), remove element. Reduced motion: fade 0.3 s, no walk.
- [ ] Smoke: screenshot `shots/preloader-walk.png` ~1.4 s after `goto` (before `is-ready`) and `shots/preloader-landing.png` ~0.9 s after `is-ready`… taken from a dedicated page so other checks are unchanged; fail if fewer than 4 prints are visible mid-walk.
- [ ] Verify: `npm run build && npm run smoke` → `SMOKE PASS`; look at both screenshots.
