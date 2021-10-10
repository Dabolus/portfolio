import path from 'path';
import childProcess from 'child_process';
import { fileURLToPath } from 'url';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const entryPoint = path.join(__dirname, '../src/index.ts');

export const outDir = path.join(__dirname, '../lib');

export const typeCheck = () =>
  new Promise((resolve, reject) =>
    childProcess.exec(`tsc -p tsconfig.json`, (error, stdout) =>
      error ? reject(stdout) : resolve(),
    ),
  );
