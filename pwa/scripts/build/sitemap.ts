import { promises as fs } from 'fs';
import path from 'path';
import { render as renderTemplate } from 'ejs';
import { minify as minifyTemplate } from 'html-minifier';
import { getAvailableLocales } from '../helpers/i18n.js';
import { computeDirname } from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);

export interface BuildSitemapData {
  readonly baseUrl: string;
  readonly pages: string[];
  readonly defaultLocale: string;
}

const sitemapTemplatePath = path.join(__dirname, '../../src/sitemap.ejs');

export const buildSitemap = async (
  outputDir: string,
  { baseUrl, pages, defaultLocale }: BuildSitemapData,
): Promise<void> => {
  const [template, availableLocales] = await Promise.all([
    fs.readFile(sitemapTemplatePath, 'utf8'),
    getAvailableLocales(),
  ]);

  // Make sure that the default locale is the first one in the array
  const locales = Array.from(availableLocales).sort((locale) =>
    locale === defaultLocale ? -1 : 0,
  );

  const renderedTemplate = await renderTemplate(
    template,
    {
      pages,
      locales,
      baseUrl,
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
