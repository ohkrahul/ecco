# SDD ledger — plan: D:\ecco\docs\2026-11-25-microsite-plan.md

Spec: D:\ecco\docs\2026-11-25-microsite-design.md

Ruling: D:\ecco is not a git repo and the user hasn't asked for commits — no worktree, no commits, no ledger scripts; this file is the record — cost if wrong: no per-task history/rollback.
Ruling: Per-task TDD replaced by one end-to-end smoke check (scripts/smoke.mjs, Edge via playwright-core) plus visual review of its screenshots — motion/visual work has no meaningful unit tests — cost if wrong: purely visual issues are only caught by eye.
Ruling: Each shoe section owns its own pose object (stage.addPose) instead of all tweening one shared state — avoids scrubbed timelines fighting over the same properties — cost if wrong: none functional.
Ruling: Hero headline sits on one line above the shoe on desktop (spec: "behind it") — two lines were fully hidden by the shoe — cost if wrong: less overlap drama.
Ruling: Craft callout leader lines are taupe, not amber — amber budget goes to the x-ray glow (one amber element per screen) — cost if wrong: none.
Ruling: Header chapter label is a small dark pill — it overlapped content once the header hides on scroll — cost if wrong: none.
Ruling: One Pair drops the dotted SVG path (the masked reveal never rendered); footprints alone draw the route — cost if wrong: spec mentions a dotted path.
Ruling: One Pair cards on phones use fixed 3+2 slots instead of points on the path — the path is too short at 390 px and cards piled up — cost if wrong: mobile loses the "cards on the route" link.
Ruling: GRUUV product shot and no-WebGL fallback use a render of the 3D model (public/img/shoe-fallback.webp, scripts/render-fallback.mjs), not the stock product-shoe.webp — consistent with the 3D shoe — cost if wrong: product-shoe.webp is unused.
Ruling: Practice Club text tiles are 1×1 (not wide) — the wide tiles left an empty grid cell — cost if wrong: none.
Ruling: Hero shoe visibility uses a trigger starting at -1 plus onRefresh re-sync on all shoe sections — a direct jump past the hero left the shoe floating over later sections (seen in reduced-motion pass) — regression check added to smoke (checkStage).
Ruling: Smoke ignores ERR_ABORTED media requests and generic "Failed to load resource" console lines (4xx are still reported with their URL) — aborted video downloads on page close aren't site errors — cost if wrong: an aborted-but-real media failure would be missed.
Ruling: Stock assets are all Pexels-licence (the stock agent rejected a Mixkit clip under the Mixkit Restricted License) — cost if wrong: none.

Task 1: complete (scaffold, styles, scroll engine, smoke check)
Task 2: complete (deck extraction, 3D model, Pexels photos/videos, credits in microsite/stock-credits.md)
Task 3: complete (stage.js: shoe, x-ray clipping cut + glow, fallback)
Task 4: complete (preloader, header)
Task 5: complete (hero, manifesto, craft)
Task 6: complete (route chapters, Don't tell them horizontal, Unseen Hours film)
Task 7: complete (finale, footer)
Task 8: complete (#EccoUnPosted, bento)
Task 9: complete (walkway, One Pair, city bento)
Task 10: complete — `npm run smoke` → SMOKE PASS at 1440/1920/390 + ?nowebgl + reduced motion; perf (headless 1440): p50 16.7 ms, p95 16.9 ms, 0 long tasks

## Round 2 (user: slide-by-slide for pitching, fresh palette, ECCO site assets, more deck images)
Ruling: au.ecco.com refused automated fetches (HTTP 429) — not retried or worked around; the user was asked to save the logo, product shots and banners into D:\ecco\ecco-site-assets\ — cost if wrong: none (pending user).
Ruling: Palette options shown as a local preview (palettes.html, dev server only); user chose "B · Nordic Sage".
Ruling: Slide mode = 23 scroll stops (src/present.js) instead of rebuilding the site as a deck — keeps scroll for the client, clicker steps between stops; HUD auto-on for localhost/?present — cost if wrong: a deployed link shows no HUD unless ?present.
Ruling: Unseen Hours poster (deck slide 13, celebrity likenesses) now used in the end frame, per "use the ppt images" — README warns not to publish it.
Final review (fresh reviewer, opus): 5 Important + 10 Minor. All Important fixed: nav into pins → stops (smoke asserts #shoe shows the shoe), F5 → top (smoke reload check RED→GREEN), finale ghost over #city (slide pass checkStage), WebGL context loss → fallback image, hidden film button → autoAlpha. Minors fixed: scrollbar-gutter, backdrop-filter build bug, mobile menu containing block, shoe fade-out instead of pop, no render while invisible, hero intro timing, menu Esc/resize, Space re-opening film, header focus-within, manifesto aria, no autoplay in reduced motion, drift on breakpoint, walkway wrap.
Final: minor (deferred): iOS Safari 100vh vs 100svh not verified (no WebKit here).
Final: minor (deferred): after a WebGL context restore the site keeps the still image instead of rebuilding the 3D scene.
Round 2: complete — `npm run smoke` → SMOKE PASS (1440/1920/390, 23-slide clicker pass, nav, reload, ?nowebgl, reduced motion); perf p50 16.7 ms, p95 16.8 ms, 0 long tasks.

## Round 3 (user: match the deck slide by slide; understand how the campaign runs; desktop only)
Ruling: au.ecco.com — WebFetch got 429; Playwright MCP could not launch Chrome; one ordinary Edge visit (playwright-core, headed, no stealth, no captcha) loaded the homepage; logo SVG taken from the page and 15 images downloaded from ECCO's public image CDNs at normal pace — user explicitly asked for another way — cost if wrong: none for a pitch to ECCO itself.
Ruling: competitor campaign images (deck slide 7) and celebrity names (slides 16, 22 list) now shown, because the microsite mirrors the deck — local pitch only, README warns.
Ruling: the five x-ray callouts now use the deck's USP wording instead of earlier invented facts (1963, tanneries) — nothing left to fact-check there.
Ruling: campaign phasing (Seed → Launch → Join in/Prove → Try → Belong, indicative weeks) is our proposal — user asked "you tell me how it need to be"; labelled "Campaign flow" in the HUD, not a deck slide.
Ruling: desktop only (user) — smoke runs 1440 + 1920; mobile CSS left as is, not maintained.

## Round 4 (user: "too much scroll — combine it, we don't have time to scroll")
Ruling: scroll site → 23-slide deck (src/deck.js): one click / key / wheel gesture = one slide; each slide's paused timeline plays on arrival; timeline labels = builds (category "And ECCO?", zone manifesto, Unseen Hours end frame) — cost if wrong: nothing scrubs with the scroll any more.
Ruling: slide timelines are built when the slide arrives and reverted after it leaves (gsap.context) — px layouts (zone circles, One Pair stops) are measured fresh, so F11/resize between slides is safe — cost if wrong: none.
Ruling: one wheel gesture = one step (a gesture ends after 220 ms without wheel events) so trackpad inertia never skips slides — cost if wrong: fast repeated wheel notches advance once.
Ruling: main is position:fixed and off-screen slides are inert — the page can never scroll, Tab stays on the current slide — cost if wrong: none.
Ruling: zone manifesto build keeps the diagram (shrunk, left) instead of fading it — the right-only manifesto left half the slide empty — cost if wrong: none.
Ruling: deleting the 8 dead scroll-era files was refused by the permission classifier (no git yet, irreversible) — left in place, unimported, until the user OKs it.
Ruling: repo root = D:\ecco; .gitignore keeps out the .pptx and raw ecco-site-assets/; vercel.json builds microsite/.
Round 4: complete — `npm run smoke` → SMOKE PASS (1440 + 1920: 26 stops / 23 slides, back through builds, nav, wheel gesture, film dialog, F5, ?nowebgl, reduced motion); perf p50 16.7 ms, p95 16.8 ms.
Ruling: published per user — GitHub ohkrahul/ecco (public, user chose "push as is" after the confidentiality warning); Vercel project ecco-walk-your-walk, Git-connected (push to main = production deploy). ecco.vercel.app is owned by another account → https://ecco-india.vercel.app added as the project domain.

## v1.1 — slide-by-slide revisions with the user (local only until the user approves; no push)
Ruling: v1.1 step 1 — "The brief" split into deck slide 2 (Business objective: one-idea hub, digital leads, 7 channels, 4 roots) and deck slide 3 (Pitch expectation: Awareness. recognise → understand → experience, 18–30 band grows leftwards from the 30–55 core); deck wording kept ("know where to experience it") — now 24 slides. SMOKE PASS 1440 + 1920 (27 stops).
Ruling: off-screen (inert) slides pause their CSS loops — cost if wrong: none.
Ruling: v1.1 step 2 — Key USPs (3D x-ray shoe) now opens the brand chapter before the brand story (user: "show the 05 before the 04"); badges renumbered so they stay in order: shoe = 04 (like deck 4's shoe divider), brand story = 05. Header "The brand" → #shoe.
Ruling: v1.1 step 3 — slide 5 ads: the deck's ad files are tiny (264–853 px; no larger originals in the .pptx), so they sit on a dark card at ≤ native size, three posters in one justified row at their own aspect ratios (flex-grow = ratio), the Walk Your Walk banner full width below — no letterboxing or cropping.
Ruling: v1.1 step 4 — "Two routes · One brief" comparison slide removed (user), with its "The choice" header link → 23 slides. SMOKE PASS 1440 + 1920 (26 stops). Pushed on the user's go-ahead.
Ruling: v1.1 step 5 — loading screen "First step" (user picked it from three concepts; design docs/2026-11-25-preloader-first-step-design.md, plan docs/2026-11-25-preloader-first-step-plan.md): 10 footprints walk in at a steady pace (≥ 2.4 s) as the site loads, then slide 1's entrance lowers the 3D shoe onto the end of the trail; the floor stays put (`ground` pose value) and the shadow darkens as the shoe comes down. The preloader layer sits under the 3D canvas (z 4 < 5) so the shoe covers its own footprints; header hidden while loading (html.is-loading). SMOKE PASS 1440 + 1920 incl. a new loading check. Local only — not pushed.
Ruling: v1.1 step 6 — loading screen: user compared three concepts on the dev server (?loader=…) and chose "Blueprint". The other two (First step, Unboxing) and the switch are removed, with the `ground` pose value they needed. The drawing is traced from slide 1's own 3D shoe at rest (scripts/capture-shoe.mjs → scripts/trace-outline.py → src/sections/shoe-outline.js); its place scales with the window width (measured equal at 1440 and 1920), so the wireframe lands on the drawing. The scan glow shows only while it moves. Local review on `npm run dev` only (user: no builds while reviewing) — not built, smoke not re-run, not pushed.

## Responsive (user: "make it responsive in every device"; plan docs/2026-11-25-responsive-plan.md, spec docs/2026-11-25-responsive-design.md)
Ruling: phones/upright tablets scroll (user picked it over a swipe deck); deck stays for wide screens, gains touch swipe — mode decided once per load, crossing the boundary reloads at the same slide (sessionStorage.resume) — cost if wrong: a rotation mid-pitch replays the loader.
Ruling: executed in the live working tree with no per-task commits and no worktree — the user reviews on the dev server and pushes on their word — cost if wrong: no per-task rollback (git has the pre-change state).
Ruling: checks = screenshots + smoke (layout/motion has no unit tests), run against the dev server (no builds during review, per the user).
Ruling: the 3D shoe follows a .shoe-slot anchor on its slide in both modes (in the deck it now glides with its slide); the blueprint drawing is placed on the same slot with the same camera maths (stage.viewWidth) — cost if wrong: none seen at 390–2560.
Ruling: scroll mode has its own builds where positions matter: category "And ECCO?" below the cards (no blur), zone manifesto below the circles (no sideways shift), One Pair photos in a grid, Unseen Hours end frame below the film.
Ruling: scroll-mode main is its own layer (z 0) and the header's frosted bar is a ::before — otherwise slide labels showed through the loader and the menu was trapped inside the header.
Ruling: key-visual grid capped at 32vw per column — at 1024×768 the fixed width pushed the heading off screen.
Ruling: smoke on phone caught two more: the 3D shoe kept rendering while its slot was off screen (slide still partly visible) -> stage skips the render then; #EccoUnPosted cards forced the column wider than 390 px -> cards sized to fit.
Final review (fresh reviewer, opus): 2 Important + 8 Minor.
Final: fixed scroll-mode snap-back (a slide built once 15% visible reset content already on screen; scrolling up re-hid read content) -> built half a screen early, played when in view, shown finished when re-entered from below; playback tween killed on revert - check-modes.mjs phone checks RED->GREEN.
Final: fixed desktop reload on resize across the mode boundary (half-screen snap, DevTools, zoom) -> live mode switching only on coarse pointers - check-modes.mjs desktop check RED->GREEN.
Final: minor (deferred): Unseen Hours clips keep playing while only its end frame is on screen (phone).
Final: minor (deferred): rotating a tablet during the loading screen is missed until the next crossing; F5 during a resume reload resumes instead of slide 1.
Final: minor (deferred): a mode-switch resume replays the full loading screen and hides the first ~0.6 s of the resumed slide's entrance.
Final: minor (deferred): iPad swipe edge cases - pan after pinch-zoom, long-press text selection, swipe from the left edge also triggers Safari back.
Final: minor (deferred, needs a real phone): the shoe may trail its slot by a frame during fast momentum scrolls.
Final: minor (deferred): desktop windows < 900 px with classic scrollbars put the scroll-mode shoe ~8 px off centre.
Final: Ruling: key-visual frames ~4% smaller at 1440x900 (32vw cap) - needed so the heading fits at 1024x768; unchanged at 1920 - cost if wrong: slightly smaller KVs on the pitch laptop.
