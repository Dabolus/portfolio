import path from 'path';
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

const build = async (_, changedPath) => {
  try {
    if (!context) {
      context = await logExecutionTime(
        esbuild.context,
        `Preparing \x1b[35mbuild context\x1b[0m...`,
        (time) =>
          `\x1b[35mBuild context\x1b[0m ready in \x1b[36m${time}\x1b[0m`,
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
        `${
          changedPath
            ? `\x1b[32m${changedPath}\x1b[0m changed, rebuilding`
            : 'Building'
        } \x1b[35mfunctions\x1b[0m...`,
        (time) =>
          `\x1b[35mFunctions\x1b[0m ${
            changedPath ? 're' : ''
          }built in \x1b[36m${time}\x1b[0m`,
      )(),
      logExecutionTime(
        typeCheck,
        `${
          changedPath
            ? `\x1b[32m${changedPath}\x1b[0m changed, retype-checking`
            : 'Type-checking'
        } \x1b[35mfunctions\x1b[0m...`,
        (time) =>
          `\x1b[35mFunctions\x1b[0m ${
            changedPath ? 're' : ''
          }type-checked in \x1b[36m${time}\x1b[0m`,
      )(),
    ]);
  } catch (error) {
    console.error(`Error!\n${error.stack || error}`);
  }
};

logExecutionTime(
  async () => {
    const watcher = chokidar.watch('src/**/*.ts', {
      ignoreInitial: true,
    });

    watcher.on('all', build);
  },
  'Starting \x1b[35mdev server\x1b[0m...',
  (time) => `\x1b[35mDev server\x1b[0m started in \x1b[36m${time}\x1b[0m`,
)().then(() => build());
