/// <reference lib="dom" />
import lighthouse, { Result } from 'lighthouse';
import puppeteer from 'puppeteer';
import { pages } from './utils.js';

const {
  env: { REPORTER_BASE_URL: baseUrl },
} = process;

export interface LighthousePageResult {
  title: string;
  pdf: Buffer;
  scores: Result.Category[];
}

export default async (): Promise<LighthousePageResult[]> => {
  console.log('Starting Chrome...');
  const chrome = await puppeteer.launch({ headless: 'new' });
  const { port } = new URL(chrome.wsEndpoint());

  const results = await pages.reduce<Promise<LighthousePageResult[]>>(
    async (previousReportsPromise, { url, title }) => {
      const previousReports = await previousReportsPromise;
      console.log(`Auditing ${title} (${baseUrl}${url})...`);
      const {
        report,
        lhr: { categories },
      } = await lighthouse(`${baseUrl}${url}`, {
        port: Number(port),
        output: 'html',
      });
      const pageWidth = 720;
      const lighthousePage = await chrome.newPage();
      await lighthousePage.setViewport({ width: pageWidth, height: 1280 });
      await lighthousePage.setContent(report.toString());
      const pageSize = await lighthousePage.evaluate(() => {
        // Expand all the metrics
        Array.from(
          document.querySelectorAll('.lh-metrics-toggle__label'),
        ).forEach((toggle) => (toggle as HTMLElement).click());
        // Remove all "not applicable" audits clumps
        Array.from(
          document.querySelectorAll('.lh-clump--notapplicable'),
        ).forEach((clump) => clump.parentElement.remove());
        // Expand all the audits clumps
        Array.from(document.querySelectorAll('.lh-clump-toggle')).forEach(
          (toggle) => (toggle as HTMLElement).click(),
        );
        // Expand all the audits details
        Array.from(document.querySelectorAll('.lh-chevron-container')).forEach(
          (chevron) => (chevron as HTMLElement).click(),
        );

        return {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight,
        };
      });
      const pdf = await lighthousePage.pdf(pageSize);

      return [
        ...previousReports,
        {
          title,
          pdf,
          scores: Object.values(categories),
        },
      ];
    },
    Promise.resolve([]),
  );

  await chrome.close();

  return results;
};
