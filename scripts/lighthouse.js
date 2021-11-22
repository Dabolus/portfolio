import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { pages } from './utils.js';

const {
  env: { REPORTER_BASE_URL: baseUrl },
} = process;

export default async () => {
  process.stdout.write('Starting Chrome...\n');
  const chrome = await puppeteer.launch();
  const { port } = new URL(chrome.wsEndpoint());

  const results = await pages.reduce(
    async (previousReportsPromise, { url, title }) => {
      const previousReports = await previousReportsPromise;
      process.stdout.write(`Auditing ${title} (${baseUrl}${url})...\n`);
      const { report } = await lighthouse(`${baseUrl}${url}`, {
        port,
        output: 'html',
      });
      const pageWidth = 720;
      const lighthousePage = await chrome.newPage();
      await lighthousePage.setViewport({ width: pageWidth, height: 1280 });
      await lighthousePage.setContent(report);
      const pageSize = await lighthousePage.evaluate(() => {
        // Expand all the metrics
        Array.from(
          document.querySelectorAll('.lh-metrics-toggle__label'),
        ).forEach((toggle) => toggle.click());
        // Remove all "not applicable" audits clumps
        Array.from(
          document.querySelectorAll('.lh-clump--notapplicable'),
        ).forEach((clump) => clump.parentElement.remove());
        // Expand all the audits clumps
        Array.from(document.querySelectorAll('.lh-clump-toggle')).forEach(
          (toggle) => toggle.click(),
        );
        // Expand all the audits details
        Array.from(document.querySelectorAll('.lh-chevron-container')).forEach(
          (chevron) => chevron.click(),
        );

        return {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight,
        };
      });
      const pdf = await lighthousePage.pdf(pageSize);
      const screenshot = await lighthousePage.screenshot({ type: 'png' });
      const thumbnail = await sharp(screenshot)
        .resize(320, 320)
        .jpeg({ mozjpeg: true })
        .toBuffer();

      return [...previousReports, { title, pdf, thumbnail }];
    },
    Promise.resolve([]),
  );

  await chrome.close();

  return results;
};
