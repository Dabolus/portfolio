import { promises as fs } from 'fs';
import path from 'path';
import { render as renderTemplate } from 'ejs';
import { minify as minifyTemplate } from 'html-minifier';
import { minify as minifyScript } from 'terser';

const templatePath = path.resolve(__dirname, '../../src/index.ejs');
const templatePromise = fs
  .readFile(templatePath)
  .then(buffer => buffer.toString('utf8'));

export async function buildTemplate(outputPath: string, data: any) {
  const template = await templatePromise;
  const renderedTemplate = renderTemplate(
    template,
    {
      ...data,
      isProd: true,
    },
    {
      filename: templatePath,
      client: false,
    },
  );
  const minifiedTemplate = minifyTemplate(renderedTemplate, {
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
  });

  const outputDir = path.dirname(outputPath);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, minifiedTemplate);
}
