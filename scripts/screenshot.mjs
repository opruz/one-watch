import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

async function shoot(viewport, name, fn) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await fn(page);
  await page.screenshot({ path: path.join(screenshotsDir, name) });
  await ctx.close();
  console.log('✓', name);
}

// Boot into focus results
async function bootToResults(page) {
  await page.goto('http://localhost:5174');
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.ob-platform-btn');
  await page.click('.ob-platform-btn:nth-child(1)');
  await page.click('.ob-platform-btn:nth-child(5)');
  await page.click('.ob-cta');
  await page.waitForSelector('.fm-cta', { timeout: 8000 });
  await page.click('.fm-cta');
  await page.waitForTimeout(1600);
  await page.waitForSelector('.fm-results');
}

// 1. Card grid — scroll so all 4 cards are visible
await shoot({ width: 1280, height: 900 }, 'shot-cards-vibrant.png', async (page) => {
  await bootToResults(page);
  await page.evaluate(() =>
    document.querySelector('.fm-results')?.scrollIntoView({ behavior: 'instant', block: 'center' })
  );
  await page.waitForTimeout(200);
});

// 2. Expanded — Severance (cold blue)
await shoot({ width: 1280, height: 900 }, 'shot-expanded-severance.png', async (page) => {
  await bootToResults(page);
  await page.click('.fm-card:nth-child(1)');
  await page.waitForSelector('.fm-sheet');
  await page.waitForTimeout(400);
});

// 3. Expanded — Everything Everywhere (magenta/violet)
await shoot({ width: 1280, height: 900 }, 'shot-expanded-eeaao.png', async (page) => {
  await bootToResults(page);
  await page.click('.fm-card:nth-child(2)');
  await page.waitForSelector('.fm-sheet');
  await page.waitForTimeout(400);
});

// 4. Expanded — The Bear (fire orange)
await shoot({ width: 1280, height: 900 }, 'shot-expanded-bear.png', async (page) => {
  await bootToResults(page);
  await page.click('.fm-card:nth-child(3)');
  await page.waitForSelector('.fm-sheet');
  await page.waitForTimeout(400);
});

// 5. Expanded — Poor Things (fuchsia/violet)
await shoot({ width: 1280, height: 900 }, 'shot-expanded-poor.png', async (page) => {
  await bootToResults(page);
  await page.click('.fm-card:nth-child(4)');
  await page.waitForSelector('.fm-sheet');
  await page.waitForTimeout(400);
});

await browser.close();
console.log('\nAll done!');
