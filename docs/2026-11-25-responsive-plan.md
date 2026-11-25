# Responsive on every device — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (user asked for it to be built locally
> now). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phones and upright tablets scroll through the 23 slides as one page; wide screens keep the deck, gain touch
swipe, and fit short laptop screens.

**Architecture:** `deck.js` decides the mode once (`scrollMode`, `html.is-scroll`) and either runs the deck (as today)
or a scroll engine (IntersectionObserver builds a slide's timeline when it comes into view, plays it through,
reverts it when it's fully out). The 3D shoe follows an anchor element (`.shoe-slot`) in its slide, so it stays on
its slide in both modes. Scroll-mode layouts live in one block at the end of `deck.css` under `.is-scroll`.

**Tech Stack:** existing Vite + GSAP + Three.js. No new dependencies.

**Spec:** `docs/2026-11-25-responsive-design.md`

## Global Constraints

- Scroll mode when `(max-width: 899px), (max-height: 559px), (orientation: portrait) and (max-width: 1199px)`.
- Crossing that boundary (rotation/resize) reloads at the same slide (`sessionStorage.resume`); F5 still starts at slide 1.
- Deck behaviour on laptops/desktops unchanged (keys, clicker, wheel, builds, HUD, F5 → slide 1).
- No horizontal scrolling, no cut-off text, no 3D shoe over another slide, in either mode.
- Local review on `npm run dev` only; production build, smoke and push only when the user says.

## Review Focus

- Phone: scrolling back up to a slide replays its entrance without a visible jump (revert only when fully off-screen) — screenshot pass scrolling down then up.
- Phone: the shoe on slide 1 while the page scrolls away — it must move up with its slide and fade, never sit over slide 2 — smoke `checkShoe` in scroll mode.
- iPad held sideways (1024×768, touch): swipe up/left = next, down/right = back; one swipe = one step — smoke touch run.
- Unseen Hours on a phone: videos only play while the slide is on screen — check `paused` after scrolling past.
- Rotation across modes mid-pitch: reload lands on the same slide — manual check in Edge device mode.

---

### Task 1: Modes, scroll engine, header/menu, touch swipe (`src/deck.js`, `index.html`, `deck.css` base rules)

**Produces:** `export const scrollMode: boolean`; `slide(id, build)` unchanged — builds may read `scrollMode`;
`window.deck` gains `mode: 'deck' | 'scroll'`.

- [ ] `scrollMode` from the query above; `html.is-scroll` toggled at import; `matchMedia(...).onchange` → store current slide id in `sessionStorage.resume`, `location.reload()`; `start()` resumes there and clears it.
- [ ] Scroll engine: one IntersectionObserver (thresholds `[0, 0.15]`): ratio ≥ 0.15 and not active → `build(el)`, `tl.play()` (reduced motion: `tl.progress(1)`); not intersecting → `leave?.()`, `ctx.revert()`. Several slides may be active at once.
- [ ] Header: `.menu-btn` (☰ / Close) shown in scroll mode toggles `.nav.is-open` (full-screen list); links scroll into view and close it; Esc closes. Progress bar follows scroll. HUD, keys, wheel only in deck mode.
- [ ] Deck mode: touch swipe (`touchstart`/`touchend`, ≥ 40 px, dominant axis; up/left = next).
- [ ] CSS base: `.is-scroll` → page scrolls (`html, body` overflow auto, height auto), `main` static, `.slide` natural height with `min-height` only for opening/close, `overflow: clip`.
- [ ] Verify (dev): 390×844 scrolls end to end, slide entrances play; 1440×900 deck unchanged.

### Task 2: Shoe anchoring (`src/stage.js`, `index.html`, `hero.js`, `craft.js`, `finale.js`)

**Consumes:** Task 1 modes. **Produces:** `stage.show(name, values, anchor?: Element)`.

- [ ] Each shoe slide gets `<div class="shoe-slot">` (with its fallback image inside). Deck mode: slot = `position:absolute; inset:0`. Scroll mode: an in-flow block (opening/close ~46svh, USPs ~40svh).
- [ ] `render()`: if the pose has an anchor, offset the shoe so it sits at the anchor's centre on screen (px → world units via the camera's visible height at z = 0). Effect in deck mode: the shoe glides with its slide.
- [ ] Verify: phone scroll — shoe stays in its slot and fades as the slide leaves; deck — at rest the shoe is where it was (blueprint drawing still lines up).

### Task 3: Scroll-mode layouts, all 23 slides (`deck.css` `.is-scroll` block; builds that position things)

- [ ] CSS per slide as in the spec (single column; grids 1–2 columns; image heights in `svh`/`vw`; type via `clamp`).
- [ ] Builds that place things absolutely adapt when `scrollMode`: category cards in a grid (no `--x/--y`), zone manifesto below (no sideways shift), One Pair stops in a grid (no path placement), Unseen Hours end frame below the film (no dimming over it), USP callouts as a list, flow footprints hidden.
- [ ] Verify: screenshots at 390×844, 844×390, 768×1024 — every slide; no overflow, nothing cut.

### Task 4: Wide-screen fit (`deck.css`)

- [ ] Short screens (`max-height: 760px`, deck mode): tighten the dense slides (practice, flows, unposted, brand, objective) so nothing is cut at 1280×720 / 1366×768; check 1024×768 and 2560×1440.

### Task 5: Checks (`scripts/smoke.mjs`, README, progress.md)

- [ ] Smoke: phone (390×844, touch) and upright-tablet (768×1024) scroll runs — scroll top to bottom in steps: no horizontal overflow, no cut text, shoe only over its slide, no errors; iPad-landscape (1024×768, touch) deck run with swipes; existing desktop runs unchanged.
- [ ] README "Desktop only" → the two modes; progress.md ruling.
- [ ] Hand to user on the dev server. Build + full smoke + push only when they say.
