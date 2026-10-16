import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

// Render the vector mark directly at every Chrome scale. No resampling of the
// old bitmap, and no padding that turns a 16px toolbar icon into a tiny mark.
const source = await readFile(new URL('../store-assets/icon.svg', import.meta.url), 'utf8');
const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const size of [16, 24, 32, 48, 128]) {
    const data = await page.evaluate(async ({ source, size }) => {
      const img = new Image();
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      canvas.getContext('2d').drawImage(img, 0, 0, size, size);
      return canvas.toDataURL('image/png').split(',')[1];
    }, { source, size });
    const png = Buffer.from(data, 'base64');
    await writeFile(new URL(`../extension/icons/icon-${size}.png`, import.meta.url), png);
    if (size === 128) await writeFile(new URL('../store-assets/store-icon-128.png', import.meta.url), png);
  }
} finally {
  await browser.close();
}
