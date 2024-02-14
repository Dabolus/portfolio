import { promises as fs } from 'node:fs';
import path from 'node:path';
import { render as renderTemplate } from 'ejs';
import { minify as minifyTemplate } from 'html-minifier';
import esbuild from 'esbuild';
import { PageData } from './models';
import { computeDirname, computeTargets } from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);

interface TemplateData {
  readonly path: string;
  readonly contentPromise: Promise<string>;
}

const templatesBasePath = path.join(__dirname, '../../src');

const getTemplateInfo = (relativePath: string): TemplateData => {
  const templatePath = path.join(templatesBasePath, relativePath);

  return {
    path: templatePath,
    contentPromise: fs.readFile(templatePath, 'utf8'),
  };
};

const templates = {
  index: getTemplateInfo('index.ejs'),
  home: getTemplateInfo('fragments/body/home.ejs'),
  about: getTemplateInfo('fragments/body/pages/about.ejs'),
  certifications: getTemplateInfo('fragments/body/pages/certifications.ejs'),
  contacts: getTemplateInfo('fragments/body/pages/contacts.ejs'),
  projects: getTemplateInfo('fragments/body/pages/projects.ejs'),
  skills: getTemplateInfo('fragments/body/pages/skills.ejs'),
};

export interface BuildTemplateOptions {
  readonly data: Omit<PageData, 'page'>;
  readonly production: boolean;
}

export interface CompileTemplateOptions
  extends Omit<BuildTemplateOptions, 'data'> {
  readonly fragment: keyof typeof templates;
  readonly pageData: PageData;
  readonly partial?: boolean;
  readonly outputPath?: string;
}

export const compileTemplate = async (
  outputDir: string,
  {
    fragment,
    pageData,
    production,
    partial,
    outputPath,
  }: CompileTemplateOptions,
) => {
  const { path: templatePath, contentPromise } =
    templates[partial ? fragment : 'index'];

  const template = await contentPromise;

  const renderedTemplate = await renderTemplate(template, pageData, {
    filename: templatePath,
    client: false,
    async: true,
  });

  const finalTemplate = production
    ? minifyTemplate(renderedTemplate, {
        // TODO: maybe migrate CSS minification to esbuild too
        minifyCSS: {
          level: {
            2: {
              all: true,
              removeUnusedAtRules: false,
            },
          },
        },
        minifyJS: (input: string) => {
          const { code } = esbuild.transformSync(input, {
            minify: true,
            legalComments: 'none',
            format: 'esm',
            target: computeTargets(),
            // Always consider import.meta as supported, as we are
            // going to replace import.meta.env at build time
            supported: { 'import-meta': true },
          });
          return code;
        },
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeOptionalTags: true,
        removeTagWhitespace: true,
        removeComments: true,
        sortAttributes: true,
        sortClassName: true,
        removeRedundantAttributes: true,
        ignoreCustomFragments: [/url\(.+?\)/],
      })
    : renderedTemplate;

  const finalOutputPath = outputPath
    ? path.join(outputDir, outputPath)
    : path.join(outputDir, partial ? 'fragments' : '', `${fragment}.html`);

  await fs.mkdir(path.dirname(finalOutputPath), { recursive: true });
  await fs.writeFile(finalOutputPath, finalTemplate);
};

export async function buildTemplate(
  outputDir: string,
  { data, production }: BuildTemplateOptions,
): Promise<void> {
  const pagesData = Object.values(data.config.pages).map<PageData>((page) => ({
    ...data,
    page,
  }));

  await Promise.all(
    pagesData.flatMap((pageData) => {
      if (pageData.page.link) {
        return [];
      }

      return [
        compileTemplate(outputDir, {
          fragment:
            pageData.page.id === 'home'
              ? 'index'
              : (pageData.page.id as keyof typeof templates),
          pageData,
          production,
          partial: false,
        }),
        compileTemplate(outputDir, {
          fragment: pageData.page.id as keyof typeof templates,
          pageData,
          production,
          partial: true,
        }),
      ];
    }),
  );
}
