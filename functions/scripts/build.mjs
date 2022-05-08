import path from 'path';
import { performance } from 'perf_hooks';
import esbuild from 'esbuild';
import { NodeResolvePlugin } from '@esbuild-plugins/node-resolve';
import { typeCheck, entryPoints, outDir, __dirname } from './utils.mjs';

const build = async () => {
  process.chdir(path.join(__dirname, '..'));

  try {
    process.stdout.write('Building functions...\n');

    const now = performance.now();

    await Promise.all([
      esbuild
        .build({
          entryPoints,
          platform: 'node',
          format: 'esm',
          target: 'node16',
          minify: true,
          sourcemap: true,
          outdir: outDir,
          plugins: [NodeResolvePlugin({ extensions: ['.ts', '.js'] })],
        })
        .then(() => {
          process.stdout.write(
            `Built in ${(performance.now() - now).toFixed(2)}ms.\n`,
          );
        }),
      typeCheck().then(() => {
        process.stdout.write(
          `Type checked in ${(performance.now() - now).toFixed(2)}ms.\n`,
        );
      }),
    ]);

    process.stdout.write('Done.\n');
  } catch (error) {
    process.stderr.write(`Error!\n${error.stack || error}\n`);
  }
};

build();
