/// <reference types="../typings" />
import path from 'node:path';
import { build as viteBuild } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { computeDirname } from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);

export interface BuildCartridgesOptions {
  readonly production: boolean;
}

export const buildCartridges = async (
  outputPath: string,
  { production }: BuildCartridgesOptions,
): Promise<void> => {
  await viteBuild({
    logLevel: 'error',
    mode: production ? 'production' : 'development',
    root: path.resolve(__dirname, '../../src/cartridges'),
    base: '/cartridges/',
    plugins: [createHtmlPlugin({ minify: production })],
    build: {
      outDir: outputPath,
      emptyOutDir: false,
      minify: production ? 'esbuild' : false,
      sourcemap: production ?? 'inline',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, '../../src/cartridges/index.html'),
          gb: path.resolve(__dirname, '../../src/cartridges/gb/index.html'),
          gbc: path.resolve(__dirname, '../../src/cartridges/gbc/index.html'),
        },
      },
    },
  });
};
