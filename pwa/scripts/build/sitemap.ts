import { promises as fs } from 'fs';
import path from 'path';
import { Data } from './models';

export interface BuildSitemapOptions {
  data: readonly Data[];
  priorities: readonly string[];
  defaultLocale: string;
}

export async function buildSitemap(
  outputDir: string,
  { data, priorities, defaultLocale }: BuildSitemapOptions,
): Promise<void> {
  const locales = data
    .map(({ locale }) => locale)
    .filter((locale) => locale !== defaultLocale);
  const now = new Date().toISOString();

  const [
    {
      data: { baseUrl },
    },
  ] = data;

  const defaultLocalizedBaseUrl = `${baseUrl}/${defaultLocale}`;

  // NOTE: we assume a maximum of 11 pages
  const sitemap = `${priorities.reduce((sitemap, page, index) => {
    const localizedPages = locales.reduce(
      (locs, locale) =>
        `${locs}<xhtml:link rel="alternate" hreflang="${locale}" href="${baseUrl}/${locale}${
          page === 'home' ? '' : `/${page}`
        }" />`,
      `<loc>${defaultLocalizedBaseUrl}${
        page === 'home' ? '' : `/${page}`
      }</loc><xhtml:link rel="alternate" hreflang="x-default" href="${defaultLocalizedBaseUrl}${
        page === 'home' ? '' : `/${page}`
      }" /><xhtml:link rel="alternate" hreflang="en" href="${defaultLocalizedBaseUrl}${
        page === 'home' ? '' : `/${page}`
      }" />`,
    );

    const changeFrequency = '<changefreq>monthly</changefreq>';

    const priority = `<priority>${(1 - index / 10).toFixed(1)}</priority>`;

    const lastModifiedAt = `<lastmod>${now}</lastmod>`;

    return `${sitemap}<url>${localizedPages}${changeFrequency}${priority}${lastModifiedAt}</url>`;
  }, '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">')}</urlset>`;

  const outputPath = path.join(outputDir, 'sitemap.xml');

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, sitemap);
}
