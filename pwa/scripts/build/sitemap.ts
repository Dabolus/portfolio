import { promises as fs } from 'node:fs';
import path from 'node:path';
import { render as renderTemplate } from 'ejs';
import { minify as minifyTemplate } from 'html-minifier';
import { getAvailableLocales } from '../helpers/i18n.js';
import { computeDirname } from '../helpers/utils.js';
import { Helpers } from './models.js';

const __dirname = computeDirname(import.meta.url);

export interface BuildSitemapData {
  readonly baseUrl: string;
  readonly pages: readonly string[];
  readonly extraPages?: readonly string[];
  readonly defaultLocale: string;
  readonly helpers: Helpers;
}

const sitemapTemplatePath = path.join(__dirname, '../../src/sitemap.ejs');

export const buildSitemap = async (
  outputDir: string,
  { baseUrl, pages, extraPages, defaultLocale, helpers }: BuildSitemapData,
): Promise<void> => {
  const [template, availableLocales] = await Promise.all([
    fs.readFile(sitemapTemplatePath, 'utf8'),
    getAvailableLocales(),
  ]);

  const locales = Array.from(availableLocales);

  const renderedTemplate = await renderTemplate(
    template,
    {
      pages,
      locales,
      defaultLocale,
      baseUrl,
      extraPages,
      helpers,
      now: new Date().toISOString(),
    },
    {
      filename: sitemapTemplatePath,
      client: false,
      async: true,
    },
  );

  const finalTemplate = minifyTemplate(renderedTemplate, {
    collapseWhitespace: true,
    keepClosingSlash: true,
  });

  const outputPath = path.join(outputDir, 'sitemap.xml');

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, finalTemplate);
};
