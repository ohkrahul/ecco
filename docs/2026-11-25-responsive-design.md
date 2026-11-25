# Responsive on every device (design)

**Why:** the pitch link will be opened on phones and tablets too (ECCO after the pitch), not only on the presenting
laptop. Today phones can't even move between slides (no swipe), and side-by-side slides run off the screen.

**Goals:** every slide readable and good-looking on phones (360–430 px), tablets (portrait and landscape), small
laptops (1280×720, 1366×768) and large screens (2560). **Non-goals:** a separate mobile copy or new content.
**Anti-goals:** horizontal scrolling, text cut off by the screen edge, the 3D shoe floating over the wrong content,
changing how the laptop presentation behaves.

## Approaches

| | How | Trade-off |
|---|---|---|
| **Scroll on narrow screens (picked)** | Phones and upright tablets get one long page: thumb-scroll, each slide's animation plays as it comes into view, "second click" reveals play by themselves. Wide screens keep the deck. | Every slide can use its natural height, so nothing is crammed; two modes to maintain. |
| Swipe deck everywhere | Phones keep one-screen slides with swipe; dense slides split into extra clicks. | Closest to presenting; cramped and much more per-slide work. |

## The two modes

- **Deck** (as today) when the screen is wide and tall enough: width ≥ 900 px, height ≥ 560 px, and not an upright
  tablet. Adds **touch swipe** (tablets held sideways), plus fixes for short laptop screens (1280×720).
- **Scroll** otherwise: phones (any orientation), upright tablets. `html.is-scroll`; normal page scroll; header =
  logo + menu button (≡) opening the chapter list; slide counter (HUD) hidden; progress bar follows the scroll.
- Rotating a tablet across the boundary reloads into the other mode at the same slide (rare; keeps the code simple).

## Per-slide layout in scroll mode (single column, natural height, min one screen for the opening and close)

Opening / Thank you: title sized to the width, the 3D shoe below it. Objective: copy, then the hub (full width),
roots 2×2. Pitch expectation: the three cards stacked (arrows point down), age bands side by side. Key USPs: heading,
the 3D x-ray shoe, then the five USPs as a list. Brand: copy, ad card full width, products wrap. Category: heading,
competitor cards in a 2-column grid, then "And ECCO?" plays over them. Audience: photo, then insights. Zone: circles,
then the manifesto below them. Route openers, key visuals, Unseen Hours (film, then the end frame below it, not on
top), #EccoUnPosted, Practice Club, Spotted, campaign flows (phases as a vertical list), out of home (belt stays),
traffic, One Pair (trip photos in a grid), BookMyShow, Owners' Club: stacked, images sized to the width.

**3D shoe in scroll mode:** it stays attached to its slide while you scroll (the stage follows the slide's position
on screen) and fades when the slide leaves, so it never floats over other content.

## Calls left to the builder

Exact breakpoints inside each slide, font sizes, which grids become 1 vs 2 columns, image heights.
Checks: screenshots at 390×844, 844×390, 768×1024, 1024×768, 1280×720, 1366×768, 1920×1080, 2560×1440; the smoke
check gains phone/tablet runs (no horizontal overflow, no cut-off text, no shoe on the wrong slide).
Local review on `npm run dev`; build, full smoke and push only when the user says.
