import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import './styles/tokens.css';
import './styles/deck.css';

import * as deck from './deck.js';
import { createStage } from './stage.js';
import * as preloader from './sections/preloader.js';
import * as hero from './sections/hero.js';
import * as craft from './sections/craft.js';
import * as category from './sections/category.js';
import * as zone from './sections/zone.js';
import * as unseenHours from './sections/unseen-hours.js';
import * as flow from './sections/flow.js';
import * as onePair from './sections/one-pair.js';
import * as finale from './sections/finale.js';
import * as slides from './sections/slides.js';

async function start() {
  let loaded = 0;
  let stage = null;
  const ready = Promise.all([
    createStage(document.getElementById('stage'), { onProgress: (p) => (loaded = p) }).then((s) => (stage = s)),
    document.fonts.ready,
  ]);
  await preloader.load({ ready, progress: () => loaded });
  if (!stage) document.documentElement.classList.add('no-webgl');

  for (const s of [hero, craft, category, zone, unseenHours, flow, onePair, finale, slides]) s.init({ stage });
  deck.start(deck.reduced ? 0 : preloader.introDelay); // slide 1's shoe arrives as the loading screen hands over
  await preloader.exit();
  document.documentElement.classList.add('is-ready'); // read by scripts/smoke.mjs
}

start();
