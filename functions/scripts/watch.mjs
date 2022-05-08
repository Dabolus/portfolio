import path from 'path';
import { performance } from 'perf_hooks';
import chokidar from 'chokidar';
import esbuild from 'esbuild';
import { NodeResolvePlugin } from '@esbuild-plugins/node-resolve';
import { typeCheck, entryPoints, outDir, __dirname } from './utils.mjs';

process.chdir(path.join(__dirname, '..'));

let builder;

const build = async () => {
  try {
    process.stdout.write('Building functions...\n');

    const now = performance.now();

    const builderPromise = builder
      ? builder.rebuild()
      : esbuild.build({
          entryPoints,
          platform: 'node',
          format: 'esm',
          target: 'node16',
          sourcemap: 'inline',
          outdir: outDir,
          incremental: true,
          plugins: [NodeResolvePlugin({ extensions: ['.ts', '.js'] })],
        });

    const [newBuilder] = await Promise.all([
      builderPromise.then((builder) => {
        process.stdout.write(
          `Built in ${(performance.now() - now).toFixed(2)}ms.\n`,
        );
        return builder;
      }),
      typeCheck().then(() => {
        process.stdout.write(
          `Type checked in ${(performance.now() - now).toFixed(2)}ms.\n`,
        );
      }),
    ]);

    builder = newBuilder;

    process.stdout.write('Done.\n');
  } catch (error) {
    process.stderr.write(`Error!\n${error.stack || error}\n`);
  }
};

const watcher = chokidar.watch('src/**/*.ts', {
  ignoreInitial: true,
});

watcher.on('all', build);
build();
