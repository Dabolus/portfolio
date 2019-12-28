/// <reference types="./typings" />
import { promises as fs } from 'fs';
import path from 'path';
import postcss from 'postcss';
import postcssSass from '@csstools/postcss-sass';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { Data } from './models';

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
    return `(${val})`;
  }

  return `${Object.entries(val).reduce(
    (finalObject, [key, value], index, array) =>
      `${finalObject}'${key}': ${toSassVariable(value)}${
        index < array.length - 1 ? ',' : ''
      }`,
    '(',
  )})`;
};

const generateSassVariables = (data: Data): string =>
  Object.entries(data).reduce(
    (variables, [key, value]) =>
      `${variables}\n$${key}: ${toSassVariable(value)};\n`,
    '',
  );

const injectData = (filePath: string, data: Data): string =>
  `${generateSassVariables(data)}\n@import '${filePath}';`;

export interface BuildStylesOptions {
  readonly data: Data;
}

export async function buildStyles(
  outputDir: string,
  { data }: BuildStylesOptions,
) {
  const { css: postprocessedStyles } = await postcssInstance.process(
    injectData('./main.scss', data),
    {
      // NOTE: this is actually a fake path, but we need to use it to
      // correctly resolve imports and generate the source map.
      from: path.resolve(__dirname, '../../src/styles/index.scss'),
    },
  );

  const outputPath = path.join(outputDir, 'styles.css');

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, postprocessedStyles);
}
