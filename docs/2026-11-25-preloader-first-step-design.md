# Loading screen v1.1 — "First step" (short design)

> **Outcome:** built, then the user asked to see the other two concepts as well and, after comparing all three on the
> dev server, chose **Blueprint**. First step and Unboxing were removed. See `progress.md` (v1.1 step 6).

**Why:** the first thing ECCO sees when the pitch opens. The user wants it more interesting and launch-like; the
pitch's own argument is *Understated by Choice*, so it must feel crafted, not loud. **Anti-goal:** fireworks, hype,
a long wait.

**Approaches considered:** *First step* (picked by the user) — footprints walk in while the site loads, the 3D shoe
lands on the last one; most on-message, reuses footprints + the hero shoe, lowest risk. *Unboxing* — shoebox opens and
the shoe rises out; most "launch", but new box artwork must match the 3D shoe and it's louder than the brand.
*Blueprint* — a pattern drawing turns into the shoe via the x-ray scan; most "craft", needs a clean line drawing,
highest effort.

**What you see**
1. Cloud-green screen (same colour as slide 1, so the hand-off is seamless). Top-left `ECCO India · Walk Your Walk`.
   Bottom-left, serif italic: *Every launch starts with one step.* Bottom-right: a small 00→100 counter.
2. A trail of footprints walks in from the left edge to the middle of the screen, where the shoe will stand. Each
   new step appears as loading progresses; older steps fade back like a trail. The walk keeps a steady pace (never a
   sprint) — about 2.5 s on a fast connection, longer if the 3D model is still downloading.
3. When everything is loaded, the text and counter fade, and the 3D shoe is lowered from above the screen onto the
   last footprints. Its shadow slides in and settles under it as it touches down (the floor stays put while the shoe
   descends). The footprints fade as it lands.
4. "Walk Your Walk." rises behind the shoe, as today. Total time to the title ≈ today's (~4 s).

**Decisions (my calls):** the shoe drop is slide 1's entrance, so pressing Home later replays the landing (without
the footprints). No 3D (`?nowebgl`): the walk plays, then slide 1 shows the still shoe image. Reduced motion: no walk
— a short fade straight to slide 1. Copy line is a proposal; easy to change.

**Touches:** `index.html` (preloader markup), `src/sections/preloader.js` (walk + exit), `src/sections/hero.js`
(the drop), `src/stage.js` (a `ground` pose value so the shadow stays on the floor during the drop),
`src/styles/deck.css` (preloader styles). Local only until the user approves; then push.
