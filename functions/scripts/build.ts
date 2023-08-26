import path from 'node:path';
import esbuild from 'esbuild';
import { NodeResolvePlugin } from '@esbuild-plugins/node-resolve';
import {
  typeCheck,
  entryPoints,
  outDir,
  __dirname,
  logExecutionTime,
} from './utils.js';

const build = async () => {
  process.chdir(path.join(__dirname, '..'));

  try {
    await Promise.all([
      logExecutionTime(
        esbuild.build,
        `Building \x1b[35mfunctions\x1b[0m...`,
        (time) => `\x1b[35mFunctions\x1b[0m built in \x1b[36m${time}\x1b[0m`,
      )({
        entryPoints,
        platform: 'node',
        format: 'esm',
        target: 'node16',
        minify: true,
        sourcemap: true,
        outdir: outDir,
        plugins: [NodeResolvePlugin({ extensions: ['.ts', '.js'] })],
      }),
      logExecutionTime(
        typeCheck,
        `Type-checking \x1b[35mfunctions\x1b[0m...`,
        (time) =>
          `\x1b[35mFunctions\x1b[0m type-checked in \x1b[36m${time}\x1b[0m`,
      )(),
    ]);
  } catch (error) {
    console.error(`Error!\n${error.stack || error}`);
  }
};

build();
