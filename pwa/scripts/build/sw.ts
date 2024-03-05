import path from 'node:path';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import esbuild from 'esbuild';
import { injectManifest } from 'workbox-build';
import { computeDirname, computeTargets } from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);
const swPath = path.join(__dirname, '../../src/sw.ts');

export interface GenerateServiceWorkerOptions {
  readonly production: boolean;
  readonly availableLocales: readonly string[];
}

export const generateServiceWorker = async (
  globDirectory: string,
  { production, availableLocales }: GenerateServiceWorkerOptions,
) => {
  const systemTmpDir = await fs.realpath(os.tmpdir());
  const tmpBuildOutputPath = path.join(systemTmpDir, 'sw.js');
  const outputPath = path.join(globDirectory, 'sw.js');
  await esbuild.build({
    entryPoints: [swPath],
    bundle: true,
    minify: production,
    sourcemap: true,
    treeShaking: true,
    legalComments: 'none',
    define: {
      'import.meta.env.BROWSER_ENV': `'${process.env.NODE_ENV}'`,
      'import.meta.env.API_URL':
        JSON.stringify(process.env.API_URL) ||
        (production ? "'/api'" : "'http://localhost:5000/api'"),
    },
    outfile: tmpBuildOutputPath,
    splitting: false,
    target: computeTargets(),
    format: 'esm',
    // Always consider import.meta as supported, as we are
    // going to replace import.meta.env at build time
    supported: { 'import-meta': true },
  });
  await injectManifest({
    swSrc: tmpBuildOutputPath,
    swDest: path.join(globDirectory, 'sw.js'),
    globDirectory,
    globPatterns: [
      './index.html',
      ...availableLocales.flatMap((locale) => [
        `./${locale}/index.html`,
        `./${locale}/fragments/**/*.html`,
      ]),
      './fonts/**/*.woff2',
      './images/**/*.{svg,jpg,webp}',
      './scripts/**/*.js',
      './styles/**/*.css',
      './90s/**/*',
      './cartridges/**/*',
    ],
  });
  // Move the source map to the same directory as the output file
  // Note that the source map might not be 100% reliable since we injected
  // the manifest in the built file, but it will still be helpful if needed.
  await fs.rename(`${tmpBuildOutputPath}.map`, `${outputPath}.map`);
  // Delete the temporary build output
  await fs.rm(tmpBuildOutputPath);
};
