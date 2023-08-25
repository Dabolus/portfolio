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

const numberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

export const logExecutionTime =
  (fn, startLogTemplate, endLogTemplate) =>
  async (...args) => {
    console.log(
      typeof startLogTemplate === 'string'
        ? startLogTemplate
        : startLogTemplate(...args),
    );
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    const diff = end - start;
    const prettyTime =
      diff < 1000
        ? `${numberFormat.format(diff)}ms`
        : `${numberFormat.format(diff / 1000)}s`;
    console.log(
      typeof endLogTemplate === 'string'
        ? endLogTemplate
        : endLogTemplate(prettyTime, ...args),
    );
    return result;
  };
