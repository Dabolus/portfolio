/// <reference types="../typings" />
import { promises as fs } from 'fs';
import path from 'path';
import postcss from 'postcss';
import postcssSass from '@csstools/postcss-sass';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { hash } from '../helpers/hash.js';
import { computeDirname } from '../helpers/utils.js';
import { Data } from '../helpers/data/index.js';

const __dirname = computeDirname(import.meta.url);

export interface BuildStyleOutput {
  readonly fileName: string;
}
export interface BuildStylesOutput {
  readonly main: BuildStyleOutput;
  readonly home: BuildStyleOutput;
  readonly about: BuildStyleOutput;
  readonly certifications: BuildStyleOutput;
  readonly contacts: BuildStyleOutput;
  readonly projects: BuildStyleOutput;
  readonly skills: BuildStyleOutput;
}

const postcssInstance = postcss([
  postcssSass(),
  postcssPresetEnv(),
  autoprefixer(),
  cssnano(),
]);

const toSassVariable = (val: unknown): string => {
  if (typeof val !== 'object' || val === null) {
    const stringifiedVal = `${val}`.replace(/[\/"']/g, '\\$&');
    return stringifiedVal.includes('.')
      ? `'${stringifiedVal}'`
      : stringifiedVal;
  }

  if (Array.isArray(val)) {
    return `(${val.map((elem) => toSassVariable(elem)).join(', ')})`;
  }

  return `${Object.entries(val).reduce(
    (finalObject, [key, value], index, array) =>
      `${finalObject}'${key}': ${toSassVariable(value)}${
        index < array.length - 1 ? ',' : ''
      }`,
    '(',
  )})`;
};

const generateSassVariables = (data: Record<string, unknown>): string =>
  Object.entries(data).reduce(
    (variables, [key, value]) =>
      `${variables}\n$${key}: ${toSassVariable(value)};\n`,
    '',
  );

const injectData = (filePath: string, data: Record<string, unknown>): string =>
  `${generateSassVariables(data)}\n@import '${filePath}';`;

const styles = {
  main: 'main',
  home: 'home',
  about: 'pages/about',
  certifications: 'pages/certifications',
  contacts: 'pages/contacts',
  projects: 'pages/projects',
  skills: 'pages/skills',
};

export interface BuildStylesOptions {
  readonly production: boolean;
  readonly data: Data;
}

export interface CompileStylesOptions extends BuildStylesOptions {
  readonly fragment?: keyof typeof styles;
}

const compileStyles = async (
  outputDir: string,
  { fragment = 'main', production, data }: CompileStylesOptions,
) => {
  const { css: postprocessedStyles } = await postcssInstance.process(
    injectData(`./${styles[fragment]}.scss`, {
      socials: data.socials,
    }),
    {
      // NOTE: this is actually a fake path, but we need to use it to
      // correctly resolve imports and generate the source map.
      from: path.resolve(__dirname, '../../src/styles/index.scss'),
    },
  );

  const stylesFile = `styles/${styles[fragment]}${
    production ? `.${hash(postprocessedStyles)}` : ''
  }.css`;

  const outputPath = path.join(outputDir, stylesFile);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, postprocessedStyles);

  return stylesFile;
};

export async function buildStyles(
  outputDir: string,
  { production, data }: BuildStylesOptions,
): Promise<BuildStylesOutput> {
  const results = await Promise.all(
    Object.keys(styles).map((fragment) =>
      compileStyles(outputDir, {
        fragment: fragment as keyof typeof styles,
        production,
        data,
      }).then((fileName) => [fragment, { fileName }]),
    ),
  );

  return Object.fromEntries(results);
}
