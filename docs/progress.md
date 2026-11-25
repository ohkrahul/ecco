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
