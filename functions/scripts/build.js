const path = require('path');
const { performance } = require('perf_hooks');
const esbuild = require('esbuild');
const { default: NodeResolve } = require('@esbuild-plugins/node-resolve');
const { typeCheck, entryPoint, outDir } = require('./utils');

const build = async () => {
  process.chdir(path.join(__dirname, '..'));

  try {
    process.stdout.write('Building functions...\n');

    const now = performance.now();

    await Promise.all([
      esbuild
        .build({
          entryPoints: [entryPoint],
          platform: 'node',
          format: 'cjs',
          target: 'node14',
          minify: true,
          sourcemap: true,
          bundle: true,
          outfile: path.join(outDir, 'index.js'),
          plugins: [
            NodeResolve({
              extensions: ['.ts', '.js'],
              onResolved: (resolved) =>
                resolved.includes('node_modules')
                  ? { external: true }
                  : resolved,
            }),
          ],
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
