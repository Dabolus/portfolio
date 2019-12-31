import { promises as fs } from 'fs';
import path from 'path';
import { render as renderTemplate } from 'ejs';
import { minify as minifyTemplate } from 'html-minifier';
import { minify as minifyScript } from 'terser';
import { Data, PageData } from './models';

const templatePath = path.resolve(__dirname, '../../src/index.ejs');
const templatePromise = fs
  .readFile(templatePath)
  .then(buffer => buffer.toString('utf8'));

export interface BuildTemplateOptions {
  readonly data: Data;
  readonly production: boolean;
}

export interface CompileTemplateOptions {
  readonly pageData: PageData;
  readonly production: boolean;
}

const compileTemplate = async (
  outputDir: string,
  { pageData, production }: CompileTemplateOptions,
) => {
  const template = await templatePromise;
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
        minifyJS: (input: string) => minifyScript(input).code!,
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
    `${pageData.data.page === 'home' ? 'index' : pageData.data.page}.html`,
  );

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, finalTemplate);
};

export async function buildTemplate(
  outputDir: string,
  { data, production }: BuildTemplateOptions,
) {
  const dob = 873148830000; // 1st Sep 1997 at 23:20:30
  const yearLength = 31556926000; // 1 year (365 days, 5 hours, 48 minutes, and 46 seconds)
  const age = ((Date.now() - dob) / yearLength).toFixed(9);

  const pagesData = data.data.pages.map<PageData>(
    ({ id: page, ...pageData }) => ({
      locale: data.locale,
      production,
      data: {
        page,
        age,
        ...data.data,
        ...pageData,
      },
    }),
  );

  await Promise.all(
    pagesData.map(pageData =>
      compileTemplate(outputDir, { pageData, production }),
    ),
  );
}
