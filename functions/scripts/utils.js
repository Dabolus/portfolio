import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import { fileURLToPath } from 'url';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const srcDir = path.join(__dirname, '../src');

export const entryPoints = fs
  .readdirSync(srcDir)
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
  .map((file) => path.join(srcDir, file));

export const outDir = path.join(__dirname, '../lib');

export const typeCheck = () =>
  new Promise((resolve, reject) =>
    childProcess.exec(`tsc -p tsconfig.json`, (error, stdout) =>
      error ? reject(stdout) : resolve(),
    ),
  );
