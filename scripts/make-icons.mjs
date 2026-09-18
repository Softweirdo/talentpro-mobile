import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

/**
 * Renders the app icon set from the brand mark in talentpro_prototype.html —
 * a white "T" on the sky gradient, the same tile the splash screen draws.
 *
 * Chromium is used rather than a design tool so the output is reproducible:
 * re-running this regenerates byte-identical assets from the same source.
 */
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT = join(ROOT, 'assets');
mkdirSync(OUT, { recursive: true });

const SKY = '#4FA8E0';
const SKY_DEEP = '#2A7EBC';
const NAVY = '#0B2540';

// Embedded as a data URI: the sandbox cannot reach Google Fonts, and an icon
// that silently falls back to a system face is not the brand mark.
const fontPath = join(
  ROOT,
  'node_modules/@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf',
);
const fontB64 = readFileSync(fontPath).toString('base64');

const page = (size, body, transparent = false) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face {
    font-family: 'Jakarta';
    src: url(data:font/ttf;base64,${fontB64}) format('truetype');
    font-weight: 800;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${size}px; height:${size}px; overflow:hidden; }
  body { background:${transparent ? 'transparent' : NAVY}; }
  .stage { width:${size}px; height:${size}px; display:grid; place-items:center; }
  .mark {
    font-family:'Jakarta', sans-serif; font-weight:800; color:#fff;
    line-height:1; user-select:none;
  }
</style></head><body><div class="stage">${body}</div></body></html>`;

const browser = await chromium.launch();

async function shot(name, size, body, { transparent = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  const p = await ctx.newPage();
  await p.setContent(page(size, body, transparent), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);

  // A glyph's line box includes ascender and descender space, so centring the
  // text node leaves the visible letterform off-centre. Measure the painted
  // pixels and shift by the difference.
  const nudge = await p.evaluate(() => {
    const el = document.querySelector('.mark');
    if (!el) return 0;
    const r = new Range();
    r.selectNodeContents(el);
    const box = r.getBoundingClientRect();
    return Math.round(window.innerHeight / 2 - (box.top + box.height / 2));
  });
  if (nudge) {
    await p.evaluate((dy) => {
      const el = document.querySelector('.mark');
      if (el) el.style.transform = `translateY(${dy}px)`;
    }, nudge);
  }

  await p.screenshot({ path: join(OUT, name), omitBackground: transparent });
  await ctx.close();
  console.log(`  ✓ ${name.padEnd(22)} ${size}×${size}${nudge ? `  (centred ${nudge > 0 ? '+' : ''}${nudge}px)` : ''}`);
}

// Full-bleed gradient. iOS and Android apply their own corner mask, so the
// artwork must not round its own corners or the result is double-rounded.
const fullBleed = (size) => `
  <div class="stage" style="background:linear-gradient(135deg, ${SKY}, ${SKY_DEEP});">
    <span class="mark" style="font-size:${size * 0.66}px;">T</span>
  </div>`;

// Android shows only the centre ~66% of an adaptive foreground; the rest can
// be clipped by whatever shape the launcher applies. Sized so the glyph covers
// roughly 45% of the canvas — comfortably inside the safe zone, but large
// enough to read on a home screen rather than floating in padding.
const adaptiveForeground = (size) => `
  <span class="mark" style="font-size:${size * 0.6}px;">T</span>`;

await shot('icon.png', 1024, fullBleed(1024));
await shot('adaptive-icon.png', 1024, adaptiveForeground(1024), { transparent: true });
await shot('favicon.png', 48, fullBleed(48));

// The splash plugin needs a real image. A rounded tile is right here because
// nothing masks it — it sits on the navy background.
await shot(
  'splash-icon.png',
  512,
  `<div style="width:220px;height:220px;border-radius:55px;
       background:linear-gradient(135deg, ${SKY}, ${SKY_DEEP});
       display:grid;place-items:center;">
     <span class="mark" style="font-size:120px;">T</span>
   </div>`,
  { transparent: true },
);

await browser.close();
console.log('\n  Icons written to assets/\n');
