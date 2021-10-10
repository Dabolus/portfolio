import path from 'path';
import { performance } from 'perf_hooks';
import chokidar from 'chokidar';
import esbuild from 'esbuild';
import { NodeResolvePlugin } from '@esbuild-plugins/node-resolve';
import { typeCheck, entryPoint, outDir, __dirname } from './utils.mjs';

process.chdir(path.join(__dirname, '..'));

let builder;

const build = async () => {
  try {
    process.stdout.write('Building functions...\n');

    const now = performance.now();

    const builderPromise = builder
      ? builder.rebuild()
      : esbuild.build({
          entryPoints: [entryPoint],
          platform: 'node',
          format: 'cjs', // TODO: set to 'esm' when Firebase Functions support it
          target: 'node14',
          sourcemap: 'inline',
          bundle: true,
          outfile: path.join(outDir, 'index.js'),
          incremental: true,
          plugins: [
            NodeResolvePlugin({
              extensions: ['.ts', '.js'],
              onResolved: (resolved) =>
                resolved.includes('node_modules')
                  ? { external: true }
                  : resolved,
            }),
          ],
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
