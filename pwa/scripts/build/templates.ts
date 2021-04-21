import { promises as fs } from 'fs';
import path from 'path';
import { render as renderTemplate } from 'ejs';
import { minify as minifyTemplate } from 'html-minifier';
import type { MinifyOutput } from 'terser';
import syncRpc from 'sync-rpc';
import { Data, Output, PageData } from './models';

const minifyScript: (code: string) => MinifyOutput = syncRpc(
  path.resolve(__dirname, '../helpers/minify.js'),
);

const templatesBasePath = path.join(__dirname, '../../src');
const templates = {
  index: path.join(templatesBasePath, 'index.ejs'),
  home: path.join(templatesBasePath, 'fragments/body/home.ejs'),
  about: path.join(templatesBasePath, 'fragments/body/pages/about.ejs'),
  certifications: path.join(
    templatesBasePath,
    'fragments/body/pages/certifications.ejs',
  ),
  contacts: path.join(templatesBasePath, 'fragments/body/pages/contacts.ejs'),
  projects: path.join(templatesBasePath, 'fragments/body/pages/projects.ejs'),
  skills: path.join(templatesBasePath, 'fragments/body/pages/skills.ejs'),
};
const templatesCache = new Map<string, Promise<string>>();

export interface BuildTemplateOptions {
  readonly data: Data;
  readonly output: Output;
  readonly production: boolean;
}

export interface CompileTemplateOptions {
  readonly fragment: keyof typeof templates;
  readonly pageData: PageData;
  readonly production: boolean;
  readonly partial?: boolean;
}

const compileTemplate = async (
  outputDir: string,
  { fragment, pageData, production, partial }: CompileTemplateOptions,
) => {
  const templatePath = templates[partial ? fragment : 'index'];

  if (!templatesCache.has(templatePath)) {
    templatesCache.set(templatePath, fs.readFile(templatePath, 'utf8'));
  }

  const template = await templatesCache.get(templatePath);

  const renderedTemplate = await renderTemplate(template, pageData, {
    filename: templatePath,
    client: false,
    async: true,
  });

  const finalTemplate = production
    ? minifyTemplate(renderedTemplate, {
        minifyCSS: {
          level: {
            2: {
              all: true,
              removeUnusedAtRules: false,
            },
          },
        },
        minifyJS: (input: string) => minifyScript(input).code,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeOptionalTags: true,
        removeTagWhitespace: true,
        removeComments: true,
        sortAttributes: true,
        sortClassName: true,
        removeRedundantAttributes: true,
      })
    : renderedTemplate;

  const outputPath = path.join(
    outputDir,
    partial ? 'fragments' : '',
    `${fragment}.html`,
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, finalTemplate);
};

export async function buildTemplate(
  outputDir: string,
  { data, output, production }: BuildTemplateOptions,
): Promise<void> {
  const dateOfBirth = 873148830000; // 1st Sep 1997 at 23:20:30
  const yearLength = 31556926000; // 1 year (365 days, 5 hours, 48 minutes, and 46 seconds)
  const age = ((Date.now() - dateOfBirth) / yearLength).toLocaleString(
    data.locale,
    {
      minimumFractionDigits: 9,
      maximumFractionDigits: 9,
    },
  );

  const pagesData = Object.entries(data.data.pages).map<PageData>(
    ([page, pageData]) => ({
      locale: data.locale,
      production,
      output,
      data: {
        page,
        age,
        ...data.data,
        ...pageData,
      },
    }),
  );

  await Promise.all(
    pagesData.flatMap((pageData) => {
      if (pageData.data.pages[pageData.data.page].link) {
        return [];
      }

      return [
        compileTemplate(outputDir, {
          fragment:
            pageData.data.page === 'home'
              ? 'index'
              : (pageData.data.page as keyof typeof templates),
          pageData,
          production,
          partial: false,
        }),
        compileTemplate(outputDir, {
          fragment: pageData.data.page as keyof typeof templates,
          pageData,
          production,
          partial: true,
        }),
      ];
    }),
  );
}
