/// <reference types="./typings" />
import { promises as fs } from 'fs';
import path from 'path';
import postcss from 'postcss';
import postcssSass from '@csstools/postcss-sass';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

import { hash } from '../helpers/hash';

export interface BuildStylesOutput {
  readonly main: string;
}

const postcssInstance = postcss([
  postcssSass(),
  postcssPresetEnv(),
  autoprefixer(),
  cssnano(),
]);

const toSassVariable = (val: unknown): string => {
  if (typeof val !== 'object' || val === null) {
    return `${val}`;
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

export interface BuildStylesOptions {
  readonly data: Record<string, unknown>;
}

export async function buildStyles(
  outputDir: string,
  { data }: BuildStylesOptions,
): Promise<BuildStylesOutput> {
  const { css: postprocessedStyles } = await postcssInstance.process(
    injectData('./main.scss', data),
    {
      // NOTE: this is actually a fake path, but we need to use it to
      // correctly resolve imports and generate the source map.
      from: path.resolve(__dirname, '../../src/styles/index.scss'),
    },
  );

  const stylesFile = `main.${hash(postprocessedStyles)}.css`;

  const outputPath = path.join(outputDir, stylesFile);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, postprocessedStyles);

  return { main: stylesFile };
}
