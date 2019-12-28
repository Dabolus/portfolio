import { promises as fs } from 'fs';
import path from 'path';
import { render as renderTemplate } from 'ejs';
import { minify as minifyTemplate } from 'html-minifier';
import { minify as minifyScript } from 'terser';
import { Data } from './models';

const templatePath = path.resolve(__dirname, '../../src/index.ejs');
const templatePromise = fs
  .readFile(templatePath)
  .then(buffer => buffer.toString('utf8'));

export interface BuildTemplateOptions {
  readonly data: Data;
  readonly production: boolean;
}

export async function buildTemplate(
  outputDir: string,
  { data, production }: BuildTemplateOptions,
) {
  const template = await templatePromise;
  const renderedTemplate = renderTemplate(
    template,
    {
      ...data,
      production,
    },
    {
      filename: templatePath,
      client: false,
    },
  );
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

  const outputPath = path.join(outputDir, 'index.html');

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, finalTemplate);
}
