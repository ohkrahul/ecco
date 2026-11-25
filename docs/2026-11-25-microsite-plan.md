# ECCO "Walk Your Walk" Pitch Microsite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the one-page, scroll-driven ECCO India pitch microsite described in the spec, runnable offline.

**Architecture:** Vite + plain ES modules. One `index.html` holds all section markup (content visible by default; JS only adds motion). Each section's motion lives in its own module under `src/sections/`. A single fixed full-screen Three.js canvas (`src/stage.js`) renders the shoe for hero, craft and finale; those sections drive it by tweening one shared state object.

**Tech Stack:** Vite, GSAP (ScrollTrigger, SplitText), Lenis, Three.js (GLTFLoader), @fontsource (Plus Jakarta Sans, Cormorant Garamond), playwright-core (smoke check, using installed Edge).

**Spec:** `D:\ecco\docs\2026-11-25-microsite-design.md`

## Global Constraints
- Project root: `D:\ecco\microsite\`. Not a git repo — no commits (user hasn't asked).
- Colour tokens exactly: ink `#121110`, charcoal `#1e1d1a`, stone `#d6cec1`, bone `#f2eee6`, taupe `#9c8f7c`, olive `#56553a`, amber `#d18d45`, mist `#8b959a`. Amber at most once per screen.
- Fonts: Plus Jakarta Sans 700/800 (headlines, tracking -0.03em), Cormorant Garamond 500 + italic (campaign lines), labels uppercase 0.3em tracking.
- All content readable with JS off / reduced motion: hidden start states are set by GSAP in JS, never in CSS.
- All motion inside `gsap.matchMedia()` `(prefers-reduced-motion: no-preference)`; reduced → no Lenis, no pins, static shoe.
- Animate only `transform`, `opacity`, `clip-path`. Easing power3/expo out, 0.8–1.4 s, no bounce.
- Assets under `public/` at fixed paths (swap later without code changes). No competitor images, no celebrity likenesses (deck slides 7 and 13 excluded).
- WebGL pixel ratio ≤ 1.5. Renders only while a shoe section is in view.
- Offline: no runtime CDN/network requests.

## Review Focus
1. **Fast scrolling / jumping via header links** through pinned sections → no section left stuck half-animated or blank. Smoke check jumps to each anchor and screenshots.
2. **Window resize / projector resolution change** mid-presentation → pins and horizontal scroll recompute (`ScrollTrigger.refresh` on resize; distances as functions). Smoke check runs at 1440, 1920, 390 widths.
3. **WebGL unavailable or model fails to load** → fallback image, rest of site works. Smoke check runs once with `?nowebgl` forcing the fallback path.
4. **Missing/slow asset** (video not yet swapped, image 404) → preloader still finishes (cap 6 s) and layout doesn't shift. Smoke check asserts preloader gone within 8 s.
5. **Keyboard/clicker** (PageDown, ArrowDown, Space, ArrowUp/PageUp) → smooth step ~85% viewport; never skips a pinned section entirely.

---

### Task 1: Scaffold, styles foundation, scroll engine, smoke check

**Files:**
- Create: `microsite/package.json`, `microsite/index.html`, `microsite/src/main.js`, `microsite/src/scroll.js`, `microsite/src/styles/tokens.css`, `microsite/src/styles/style.css`, `microsite/scripts/smoke.mjs`, `microsite/README.md`

**Interfaces:**
- Produces: `initScroll(): { lenis: Lenis | null }` in `src/scroll.js` — registers ScrollTrigger + SplitText, creates Lenis (motion only), wires `lenis.on('scroll', ScrollTrigger.update)` + gsap ticker, keyboard stepping. `export const mm = gsap.matchMedia()` and `export const MOTION = '(prefers-reduced-motion: no-preference)'` from `src/scroll.js`.
- Produces: section modules each export `init(ctx)` where `ctx = { lenis, stage }`; `main.js` calls them in page order.
- Produces: `index.html` section skeleton with ids: `preloader`, `top` (hero), `manifesto`, `shoe`, `route-01`, `dont-tell`, `unseen-hours`, `unposted`, `practice-club`, `route-02`, `not-in-ecco`, `one-pair`, `city`, `finale`, footer `site-footer`; each section has `data-theme="ink|stone|bone|charcoal"`.

- [ ] **Step 1:** `npm create vite@latest microsite -- --template vanilla`, delete demo files; `npm i gsap lenis three @fontsource/plus-jakarta-sans @fontsource/cormorant-garamond`; `npm i -D playwright-core`. Scripts: `dev`, `build`, `preview`, `smoke` (`node scripts/smoke.mjs`).
- [ ] **Step 2: Write the smoke check** `scripts/smoke.mjs`: launches `chromium` via playwright-core with `channel: 'msedge'` against `process.env.URL || 'http://localhost:4173'`; for widths `[1440, 1920, 390]`: collect `pageerror` + console `error`; assert `#preloader` hidden within 8 s; assert every id above exists; wheel-scroll the page in 12 equal steps screenshotting to `shots/<w>-<n>.png`; click each header anchor and screenshot; then reload with `?nowebgl` and assert `.shoe-fallback` visible. Exit 1 on any error/assertion with a message.
- [ ] **Step 3:** Run `npm run build && npm run preview` (bg) then `npm run smoke` → Expected: FAIL (sections missing).
- [ ] **Step 4:** Write tokens (spec colour table + type scale with `clamp()`), base styles (reset, section padding `clamp(80px,12vw,160px)`, label style, grain overlay on `[data-theme=ink]`, `.line` motif), skeleton markup with real copy from spec, `scroll.js`. Keyboard stepping: PageDown/ArrowDown/Space → `lenis.scrollTo(scrollY + innerHeight*0.85, {duration:1.1})`, reverse for up; ignore when focus is in an input.
- [ ] **Step 5:** `npm run build && npm run smoke` → Expected: only failures for not-yet-built pieces (preloader, fallback), no JS errors.

### Task 2: Assets

**Files:**
- Create: `microsite/public/img/*.webp`, `microsite/public/models/shoe.glb`, `microsite/public/video/*.mp4`, `microsite/scripts/extract-deck.py`, credits section in `README.md`

**Interfaces:**
- Produces fixed asset paths used by markup: `img/kv-long-way-up.webp`, `img/kv-magic.webp`, `img/kv-weekend.webp`, `img/kv-ridiculously-good.webp`, `img/ooh-travelator.webp`, `img/ooh-bench.webp`, `img/ooh-*.webp` (remaining slides 19–21), `img/unposted-1..8.webp`, `img/practice-*.webp`, `img/journey-airport|city|sightseeing|shopping|dinner.webp`, `img/city-*.webp`, `img/shoe-fallback.webp`, `video/unseen-1..4.mp4`, `video/unseen-poster.webp`, `models/shoe.glb`.

- [ ] **Step 1:** `extract-deck.py <pptx> <outdir>` (run with `python -I`): unzip media, convert chosen deck images to WebP (Pillow, quality 82, max 2400 px long edge). Map: KVs = deck media image12–15 (verify each visually), OOH = image26–30, unposted refs = image18–20. Skip image6–10 (competitors) and image17 (celebrities).
- [ ] **Step 2:** Download `MaterialsVariantsShoe.glb` from KhronosGroup/glTF-Sample-Assets (raw GitHub) → `public/models/shoe.glb`.
- [ ] **Step 3:** Stock photos/videos: find via WebSearch on Unsplash/Pexels/Mixkit photo pages, download only through official download links (no scraping, no unofficial APIs). Convert photos to WebP ≤ 2400 px; videos via ffmpeg to H.264 1280 px, ≤ 8 s, no audio, `-movflags +faststart`. If a source is blocked, fill the slot with a crop of a deck image and list it in README as "needs stock".
- [ ] **Step 4:** Verify: `ls public/img public/video public/models` shows every path in Interfaces; README lists each asset's source + licence + "brand facts to confirm".

### Task 3: Three.js stage (shoe, x-ray, fallback)

**Files:**
- Create: `microsite/src/stage.js`

**Interfaces:**
- Produces: `createStage(canvas: HTMLCanvasElement, { onProgress(p: 0..1) }): Promise<Stage | null>` — returns `null` (and adds `html.no-webgl`) when WebGL fails or `?nowebgl` is present.
- `Stage.state`: plain object GSAP tweens directly — `{ rotX, rotY, rotZ, x, y, scale, sweep /*0..1 x-ray position*/, xray /*0|1 visibility of glow plane*/, visible /*0..1 canvas opacity*/ }`.
- `Stage.setActive(on: boolean)` — starts/stops the render loop.

- [ ] **Step 1:** Renderer: `antialias`, `alpha: true`, `setPixelRatio(Math.min(devicePixelRatio, 1.5))`, `localClippingEnabled = true`, ACES tone mapping, sRGB. Canvas fixed full-screen, `pointer-events:none`, z-index above section backgrounds, below `.above-stage` text.
- [ ] **Step 2:** Load GLB with `THREE.LoadingManager` → `onProgress`. Normalise: centre via bounding box, scale to unit length. Recolour every mesh material to cream leather (`color #e8e1d4`, keep normal/roughness maps, drop base-colour map) so it reads as a neutral ECCO-style shoe.
- [ ] **Step 3:** X-ray: clone each mesh with `MeshBasicMaterial({ color: amber, wireframe: true, transparent: true, opacity: 0.55, blending: AdditiveBlending })`. One `THREE.Plane` (normal +X): leather meshes clip with `plane`, wireframe clones with the negated plane; `plane.constant` maps from `state.sweep` across the model's bounding box. Add a thin vertical additive amber glow quad at the sweep position, opacity = `state.xray`.
- [ ] **Step 4:** Lights: soft key (warm), rim (cool mist), ambient; shadow-catcher plane under the shoe (`ShadowMaterial` opacity 0.25). Cursor tilt: ±0.08 rad lerped, added on top of `state.rotX/rotY`.
- [ ] **Step 5:** Verify: `npm run dev`, open `/` → shoe renders and turns; `/?nowebgl` → fallback image shows, no console errors.

### Task 4: Preloader + header

**Files:**
- Create: `microsite/src/sections/preloader.js`, `microsite/src/sections/header.js`

**Interfaces:**
- Consumes: `createStage` `onProgress`; `lenis`.
- Produces: `preloader.run(progressSource): Promise<void>` resolves after the split-open animation; caps at 6 s regardless of loads.

- [ ] **Step 1:** Preloader per spec (counter 00→100 tracks real progress, bone line grows; at 100 line → "—— WALK YOUR WALK." label; ink halves split top/bottom). Lenis stopped until done.
- [ ] **Step 2:** Header per spec: transparent → frosted after 40 px; hide on down / show on up (ScrollTrigger `onUpdate` direction); amber progress line `scaleX` = page progress; chapter label switches on entering `#route-01` / `#route-02` ranges and clears outside; anchors use `lenis.scrollTo(target)`; mobile menu toggle (< 768 px).
- [ ] **Step 3:** Verify with `npm run smoke` → preloader assertion passes; screenshots show header states.

### Task 5: Hero, manifesto, craft (shared opening)

**Files:**
- Create: `microsite/src/sections/hero.js`, `microsite/src/sections/manifesto.js`, `microsite/src/sections/craft.js`

**Interfaces:**
- Consumes: `Stage.state`, `Stage.setActive`, `mm`, `MOTION`.

- [ ] **Step 1: Hero** — pinned `+=150%`, scrubbed timeline: SplitText chars of "Walk Your Walk." drift apart (random x ±120px, y, opacity → 0); `state.rotY` from 3/4 (≈ -0.6) to side profile (≈ -1.57), `state.y` slight drop; `body` background ink → stone via the section's own bg tween. Idle slow turn before scroll.
- [ ] **Step 2: Manifesto** — pinned `+=120%`, SplitText words opacity 0.15 → 1 staggered, scrub; second paragraph fades up after.
- [ ] **Step 3: Craft** — pinned `+=250%`: shoe comes back large; `state.sweep` 0 → 1, `state.xray` 0 → 1 → 0, `state.rotY` slow turn; 4 callouts (SVG leader lines drawn via `stroke-dashoffset`, label fade-up) triggered at sweep 0.2/0.4/0.6/0.8. `Stage.visible` 0 outside hero/craft/finale.
- [ ] **Step 4:** Verify smoke screenshots 1–4 at 1440: shoe visible in hero, words partially lit in manifesto, x-ray half-swept with callouts in craft.

### Task 6: Route 01 — chapter intro, Don't tell them, Unseen Hours

**Files:**
- Create: `microsite/src/sections/chapter.js`, `microsite/src/sections/dont-tell.js`, `microsite/src/sections/unseen-hours.js`

- [ ] **Step 1: Chapter intro** (shared by both routes, `.chapter` elements): line draws, label + headline rise.
- [ ] **Step 2: Don't tell them** — pin; horizontal track `x: () => -(track.scrollWidth - innerWidth)`, `end: () => '+=' + distance`, `invalidateOnRefresh`. Panels: 4 KV posters (clip-path `inset(0 100% 0 0)` → `inset(0)` + scale 1.1 → 1 via `containerAnimation`) interleaved with 3 kinetic type panels ("Master a skill." / "Ace a sport." / "Perfect your style." → serif "Don't tell them.").
- [ ] **Step 3: Unseen Hours** — pin `+=300%`: video card `clip-path: inset(22% 28% round 24px)` → `inset(0% 0% round 0px)`; captions sequence ("05:40 — Before anyone's up." · "Practice." · "Script reading." · "Recovery." · "Again."), hour counter `0 → 10,000` mapped to progress; end frame "Even when no one's watching." + "Play the film" button opening a `<dialog>` full-screen `<video controls>`. Videos `muted playsinline loop`, play only while in view.
- [ ] **Step 4:** Verify smoke: horizontal panel mid-scroll screenshot shows a KV half-revealed; film card full-bleed with a caption; dialog opens/closes with Esc.

### Task 7: Finale + footer (core complete)

**Files:**
- Create: `microsite/src/sections/finale.js`, `microsite/src/footprints.js`

**Interfaces:**
- Produces: `footprintSVG(side: 'L'|'R'): string` and `placeFootprints(path: SVGPathElement, count: number): SVGGElement[]` in `src/footprints.js` (used again in Task 9). Placement: points at equal arc length via `getPointAtLength`, alternate ±10 px along the normal, rotated to the tangent.

- [ ] **Step 1: Finale** — shoe returns to rest centre (`state` tween on enter), "Walk Your Walk." SplitText rise, amber footprints along a straight path to the right edge revealed sequentially, CTAs.
- [ ] **Step 2: Footer** — giant "ecco" wordmark `yPercent: 100 → 0` scrubbed as the footer enters; links, credits, line motif.
- [ ] **Step 3:** Verify: full smoke run at 1440 + 1920 passes with zero JS errors. **Checkpoint: show the user the core.**

### Task 8: #EccoUnPosted + Practice Club

**Files:**
- Create: `microsite/src/sections/unposted.js`, `microsite/src/sections/bento.js`

- [ ] **Step 1: UnPosted** — 8 cards absolutely placed in a loose scatter (desktop) / 2-col (mobile); each `data-speed` (0.6–1.4) → scrubbed `y` parallax; on enter, `.is-struck` class animates a strike line through the "Posted" tag (CSS `scaleX` transition). Three format tiles below.
- [ ] **Step 2: Bento** (used by `#practice-club` and `#city`): tiles rise with stagger 0.08; CSS hover `scale(1.06)` on image + caption slide-up.
- [ ] **Step 3:** Verify smoke screenshots show cards at varied offsets and struck tags.

### Task 9: Route 02 — Not in ECCO, One Pair, City

**Files:**
- Create: `microsite/src/sections/walkway.js`, `microsite/src/sections/one-pair.js`

- [ ] **Step 1: Walkway** — track duplicated for seamless loop; gsap ticker moves `x` at base 0.6 px/frame + `abs(lenis.velocity) * 0.35`, smoothed (lerp 0.08), wraps at half width; pauses off-screen. Serif headline lines rise in.
- [ ] **Step 2: One Pair** — pin `+=250%`; dotted path revealed through an SVG mask whose solid path animates `stroke-dashoffset` 1 → 0 (`pathLength=1`); 14 footprints from `placeFootprints` fade in as progress passes their position; 5 stop cards pop (scale 0.9 → 1, opacity) at 0.1/0.3/0.5/0.7/0.9; end on product shot.
- [ ] **Step 3: City** bento uses Task 8's bento.
- [ ] **Step 4:** Verify smoke screenshots: belt mid-motion, path half drawn with footprints and 2–3 cards.

### Task 10: Polish & final verification

- [ ] **Step 1:** Reduced motion: emulate `prefers-reduced-motion: reduce` in smoke (extra pass) → no pins, all text visible, no errors.
- [ ] **Step 2:** Mobile 390 px: check every screenshot — no horizontal overflow (`document.documentElement.scrollWidth <= innerWidth` asserted in smoke), text sizes, shoe framing.
- [ ] **Step 3:** Performance: Chrome DevTools trace while scrolling (if MCP available, else Edge performance via playwright tracing) → no long tasks > 100 ms during scroll; CLS ≈ 0.
- [ ] **Step 4:** Offline: build, disconnect-equivalent check — smoke asserts zero requests to non-localhost hosts.
- [ ] **Step 5:** Final `npm run build && npm run smoke` all widths + reduced-motion → PASS. README: how to run in the pitch room, asset swap table, brand facts to confirm.
