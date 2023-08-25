import path from 'path';
import { performance } from 'perf_hooks';
import chokidar from 'chokidar';
import esbuild from 'esbuild';
import { NodeResolvePlugin } from '@esbuild-plugins/node-resolve';
import {
  typeCheck,
  entryPoints,
  outDir,
  __dirname,
  logExecutionTime,
} from './utils.js';

process.chdir(path.join(__dirname, '..'));

let context;

const build = async () => {
  try {
    if (!context) {
      context = await logExecutionTime(
        esbuild.context,
        `Preparing build context...`,
        (time) => `Build context ready in ${time}`,
      )({
        entryPoints,
        platform: 'node',
        format: 'esm',
        target: 'node16',
        sourcemap: 'inline',
        outdir: outDir,
        plugins: [NodeResolvePlugin({ extensions: ['.ts', '.js'] })],
      });
    }

    await Promise.all([
      logExecutionTime(
        context.rebuild,
        'Building functions...',
        (time) => `Functions built in ${time}`,
      )(),
      logExecutionTime(
        typeCheck,
        'Type-checking functions...',
        (time) => `Functions type-checked in ${time}`,
      )(),
    ]);
  } catch (error) {
    console.error(`Error!\n${error.stack || error}\n`);
  }
};

const watcher = chokidar.watch('src/**/*.ts', {
  ignoreInitial: true,
});

watcher.on('all', build);
build();
