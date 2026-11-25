# ECCO India — "Walk Your Walk" pitch microsite — Design

Date: 2026-11-25 · Status: approved (user: "use vite also plan a color combination after that start building")

## Intent

A one-page, scroll-driven microsite that the agency shows to ECCO in the next pitch round, alongside the deck `D:\ecco\ECCO_India_Launch_23 Nov.pptx`. It has to make the client say "this is the campaign, alive." The client asked for a more animated, more advanced site. Apple-level polish, with Nike-level energy in a few places.

The brand idea from the deck is **Understated by Choice**: *"In a world that celebrates showing off, we celebrate showing up."* Tagline: **Walk Your Walk.** The site's organising idea follows from it: **the site doesn't tell you everything up front. Scrolling reveals what's hidden** — the inside of the shoe, the unseen hours, the unposted moments. Most motion is slow, precise and heavy. Route 02 sections are allowed to be playful.

Audiences, from the deck: 18–30 (new) and 30–55 (core buyers). USPs: comfort, Danish design, ECCO makes every stage itself (incl. own tanneries), contemporary design, made for walking.

## Goals
- A cinematic scroll story that presents **both campaign routes as two clearly labelled chapters**, so ECCO can feel each and choose.
- Runs **fully offline** from a local build in the pitch room. Can later be deployed to a Vercel link (only when the user says so; `noindex`).
- Desktop-first (1440–1920 px; must also hold up on a 4K screen). Must still work well on a phone at 390 px — the client will open the link afterwards.
- Smooth: no visible stutter while scrolling on an ordinary laptop.
- **Asset swap is trivial later**: every image, video and the 3D model loads from a fixed path under `public/`. Replacing a file with the real one (client photography, Google Veo films, real shoe model) needs no code change.

## Non-goals
E-commerce, a real store locator, CMS, forms, analytics, SEO, multiple pages, regional language versions. "Find a store" etc. go nowhere (`#`).

## Anti-goals (it fails if…)
- Motion feels loud, gimmicky or "template" — that contradicts Understated by Choice.
- It stutters, shows a blank screen, or needs the internet during the pitch.
- It uses competitor imagery (deck slide 7) or identifiable celebrity likenesses (deck slide 13 "Unseen Hours" KV is **not** used).

## Constraints
- **Assets now are placeholders**, chosen to look good:
  - Deck images (extracted from the .pptx). The four key visuals have headline + ECCO logo baked in, so they appear as framed campaign posters, never as backgrounds under live text. Small deck images (< 600 px) only at small sizes, or replaced with stock.
  - Free stock photos (Unsplash / Pexels licence) for full-bleed and text-over-image moments: warm, natural, cinematic, Indian context where possible, matching the key-visual palette.
  - Free stock video (Pexels / Mixkit) for the film section — to be replaced by the user's Google Veo footage.
  - 3D shoe: Khronos glTF sample **MaterialsVariantsShoe** (CC-BY 4.0, Shopify) — credited in the footer. To be replaced by a real ECCO model.
- ECCO logo: clean SVG of the wordmark if sourceable; else "ecco" set in the headline font as placeholder.
- Brand facts (1963 Denmark, own tanneries, direct-injected soles) **to be confirmed with the client** — listed in the README.
- Presenting: live on the user's Windows laptop (has Node) with trackpad/mouse; `npm run preview` serves the offline build. Arrow keys / PageDown jump between section stops as a clicker backup.

## Approaches considered
1. **Vite + plain JavaScript, GSAP + ScrollTrigger + SplitText, Lenis, Three.js — chosen** (confirmed by user). Bundled locally → offline; light; easy to hand over.
2. Plain HTML + CDN libraries — rejected: needs internet in the pitch room.
3. Next.js + React Three Fiber — rejected for now: heavier, no gain for a one-page demo. Right choice for the live production build.

## Change log
- 2026-11-25 (round 3, user: "it's not matching the slides… first understand the campaign"): rebuilt as **the deck, alive** — one chapter per deck slide in deck order (brief, brand, category, audience, zone, Route 01 slides 10–16, Route 02 slides 17–24, Owners' Club 25), deck wording used verbatim, ECCO's own logo/products/photos from au.ecco.com, competitor wall for slide 7. Added three **campaign-flow** slides (our proposal, user asked us to define it): each route runs Seed (PR, wks 1–2) → Launch (wk 3) → Join in / Prove (wks 3–8) → Try (wks 4–12) → Belong (always on), mapped to the brief's recognise / understand / experience; plus "Two routes, one brief". Desktop only.
- 2026-11-25 (after first review with the user): palette replaced by **Nordic Sage** (light, airy — user found the earthy dark palette too heavy and asked for "fresh"); added **slide mode** (23 stops mapped to deck slides, clicker-driven, counter HUD) for presenting side by side with the PPT; added deck images (ECCO's existing ads, Unseen Hours poster). Tokens live in `microsite/src/styles/tokens.css`; the table below is the original palette, kept for the record.

## Colour plan (original — superseded)

Taken from the key visuals: overcast skies, stone, olive trousers, taupe leather, cream soles, low sunrise. Two moods, mapped to the two routes: **Route 01 lives in the dark** (the unseen, early mornings, nobody watching). **Route 02 lives in daylight** (public spaces, out in the open, playful).

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#121110` | Dark section background (warm black, never pure #000) |
| `--charcoal` | `#1e1d1a` | Cards/surfaces on dark, body text on light |
| `--stone` | `#d6cec1` | Calm light background (manifesto, Route 02) |
| `--bone` | `#f2eee6` | Lightest background; main text on dark |
| `--taupe` | `#9c8f7c` | Secondary text, muted labels, leather tone |
| `--olive` | `#56553a` | Route 01 accent (labels, chapter marks, dividers) |
| `--amber` | `#d18d45` | The one bright accent: progress line, CTAs, x-ray glow, footsteps |
| `--mist` | `#8b959a` | Cool overcast grey: captions on film, subtle borders |

Rules:
- Amber is rare — at most one amber element per screen. It marks "the walk" (progress line, footsteps, the x-ray sweep) and primary CTAs.
- Text contrast: bone on ink, charcoal on stone/bone. Taupe only for large or secondary text (check ≥ 4.5:1 for body).
- Section colours flow, not cut: backgrounds cross-fade on scroll between neighbours (e.g. hero ink → stone).

| Section | Background | Accent |
|---|---|---|
| Preloader, Hero start | ink | bone line |
| Manifesto | stone | ink words |
| The unseen part (craft) | ink | amber x-ray |
| Route 01 chapter (4–7) | ink / charcoal | olive marks, bone type |
| Route 02 chapter (8–10) | bone / stone | charcoal type, amber footsteps |
| Finale, Footer | ink | amber CTA |

## Typography
Self-hosted via `@fontsource` (offline):
- Headlines: **Plus Jakarta Sans** 700/800, tracking -0.03em, huge.
- Campaign lines ("The Unseen Hours", "Not in ECCO? This should help."): **Cormorant Garamond** 500/italic.
- Labels: sans, uppercase, letter-spacing 0.3em — the deck's "—— WALK YOUR WALK." style.

## Motion
- Signature motif — **the line**: preloader bar → header progress line → self-drawing section dividers.
- Slow easing (power3/expo out), 0.8–1.4 s, no bounce. Lenis smooth scroll.
- `prefers-reduced-motion`: final states shown, pinned sections become stacked, 3D shoe static.
- Subtle film grain on dark sections.

## Page, top to bottom

**Preloader** — ink screen; counter 00→100 bottom-left; bone line grows across as critical assets load. At 100 the line becomes "—— WALK YOUR WALK." and the screen splits open to the hero. ≤ 2.5 s after load.

**Header** — 56 px; transparent over hero, frosted charcoal after scroll. Left: ECCO logo. Centre: The Shoe · Route 01 · Route 02 · Practice Club. Right: "Find a store" pill (amber on hover). Hides on scroll down, returns on scroll up. Amber 1 px progress line along its bottom. While inside a chapter, a small label shows "ROUTE 01 — DON'T TELL THEM" / "ROUTE 02 — NOT IN ECCO?". Mobile: links collapse to a full-screen menu.

### Shared opening
1. **Hero — "Walk Your Walk."** 3D shoe in a dark studio, slow turn, slight cursor tilt; headline huge behind it; "Understated by choice." below. Scroll (pinned, scrubbed): letters drift apart, shoe turns to side profile mid-stride, background ink → stone.
2. **Manifesto** — "In a world that celebrates showing off, we celebrate showing up." Pinned; words 15% → 100% one by one. Then "Putting in the work. Getting ridiculously good at what you do. Letting it speak for itself."
3. **The unseen part (craft)** — id `shoe`. "What you don't see is what you feel." Pinned; an amber glowing plane sweeps through the 3D shoe: leather one side, fine amber wireframe the other (clipping planes, two materials). Callouts draw in on leader lines: Own tanneries · Sole injected straight onto the upper · Danish design since 1963 · Every stage made by ECCO.

### Route 01 — "Don't tell them." (dark)
Chapter intro: full-screen ink card, "ROUTE 01" label in olive, "Master a skill. Don't tell them." — line draws in.
4. **Don't tell them** — the four KVs as posters in a pinned horizontal scroll; clip-path wipe reveals with slight scale-down; between them kinetic type panels "Master a skill. / Ace a sport. / Perfect your style." → "Don't tell them." (serif).
5. **The Unseen Hours** — id `unseen-hours`. Small rounded video card grows to full-bleed on scroll; timestamps tick past ("05:40 — Before anyone's up." · "Practice." · "Script reading." · "Recovery." · "Again."); hour counter in the corner. End frame "Even when no one's watching." + "Play the film" (full-screen player, placeholder clip).
6. **#EccoUnPosted** — "Some moments aren't for the feed." Scatter of 9:16 story cards drifting at different speeds; each card's "Posted" tag strikes through as it enters. Three format tiles: Template sticker · Celebrity challenge · Podcast.
7. **Get ridiculously good (on ground)** — id `practice-club`. Bento: ECCO Practice Club (piano, table tennis, mini-golf zones) · Celebrities spotted in ECCO · Owners' Club (hobby academies). Tiles rise with stagger; hover zooms + reveals one line.

### Route 02 — "Not in ECCO? This should help." (daylight)
Chapter intro: bone screen, "ROUTE 02" label, the line in the serif.
8. **Not in ECCO?** — id `not-in-ecco`. Headline large in serif; OOH images (moving walkway, escalator, shoe benches — deck slides 18–21) ride a continuous "moving walkway" strip that speeds up with scroll velocity, then eases back. Short wry captions.
9. **One Pair. Everywhere.** — "One pair. Every plan." Pinned; dotted SVG path draws across, amber footprints appear step by step: Airport → City walk → Sightseeing → Shopping → Dinner; a photo card pops at each stop. Ends on a GRUUV-style product shot.
10. **The city is better on foot** — Bento: ECCO After Hours × BookMyShow night walks ("Some places are better discovered on foot.") · Celebrity chooses to walk (stuck-in-traffic moment) · Owners' Walking Club.

### Shared close
11. **Finale** — ink; 3D shoe at rest centre; "Walk Your Walk." huge; amber footprints walk off-screen right; CTAs Find a store · Explore the collection.

**Footer** — store locator, Instagram/YouTube, "Danish since 1963", 3D model credit, placeholder legal. Giant full-width "ecco" wordmark rising into view at the end. Line + "WALK YOUR WALK."

## Build order
Core first, so a presentable site exists early: preloader, header, 1, 2, 3, Route 01 (4, 5), 11, footer → then 6, 7, Route 02 (8, 9, 10) → polish, mobile, reduced motion, perf.

## Performance & robustness
- One Three.js renderer/canvas reused for sections 1, 3, 11; pixel ratio capped (≤ 1.5) so 4K stays smooth.
- Images WebP, sized for slots, fixed dimensions; lazy-load below the fold.
- WebGL failure → still product image.
- `npm run build` → `dist/`, served offline with `npm run preview`.

## Left to the builder
Exact timings and scroll distances; copy polish within the deck's lines; stock photo/video picks within the look; folder layout; 3D lighting (aim: neutral stone/cream leather).
