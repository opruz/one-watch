import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, '..', 'screenshots');

// Read each screenshot as base64
const toB64 = (file) =>
  'data:image/png;base64,' +
  fs.readFileSync(path.join(screenshotsDir, file)).toString('base64');

const shots = [
  { file: 'shot-onboarding.png',    label: '① Onboarding' },
  { file: 'shot-focus.png',         label: '② Focus — Questionnaire' },
  { file: 'shot-focus-results.png', label: '③ Focus — AI Picks' },
  { file: 'shot-explore.png',       label: '④ Explore Mode' },
];

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #060610;
    font-family: 'Segoe UI', system-ui, sans-serif;
    padding: 32px;
  }
  h1 {
    color: #e8c47a;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  h1 span { color: rgba(255,255,255,0.35); font-size: 13px; font-weight: 400; }
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .label {
    color: #e8c47a;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .frame {
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    line-height: 0;
  }
  .frame img {
    width: 100%;
    display: block;
  }
</style>
</head>
<body>
<h1>◉ One Watch <span>— all 4 views</span></h1>
<div class="grid">
${shots
  .map(
    (s) => `  <div class="card">
    <p class="label">${s.label}</p>
    <div class="frame"><img src="${toB64(s.file)}" /></div>
  </div>`
  )
  .join('\n')}
</div>
</body>
</html>`;

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 600 } });
const page = await ctx.newPage();
await page.setContent(html, { waitUntil: 'load' });

// Fit to actual content height
const bodyH = await page.evaluate(() => document.body.scrollHeight);
await ctx.close();

const ctx2 = await browser.newContext({ viewport: { width: 1600, height: bodyH } });
const page2 = await ctx2.newPage();
await page2.setContent(html, { waitUntil: 'load' });
await page2.waitForTimeout(300);

const out = path.join(screenshotsDir, 'shot-composite.png');
await page2.screenshot({ path: out, fullPage: true });
console.log('Saved:', out);
await browser.close();
