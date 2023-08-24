import path from 'node:path';
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import childProcess from 'node:child_process';
import esbuild from 'esbuild';
import { NodeResolvePlugin } from '@esbuild-plugins/node-resolve';
import { globby } from 'globby';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runScript = (script) =>
  new Promise((resolve, reject) => {
    const process = childProcess.spawn(
      'yarn',
      [
        'node',
        '-r',
        'dotenv/config',
        '--experimental-import-meta-resolve',
        script,
      ],
      {
        stdio: 'inherit',
      },
    );
    process.once('close', resolve);
    process.once('error', reject);
  });

const [, , script] = process.argv;

const build = async () => {
  process.chdir(__dirname);

  const entryPoints = await globby(path.join(__dirname, '**/*.ts'));
  const outdir = path.join(__dirname, '..', '.scripts-compiled');
  // const outfile = path.join(outdir, script, 'index.js');

  await esbuild.build({
    entryPoints,
    platform: 'node',
    format: 'esm',
    target: 'node16',
    minify: false,
    sourcemap: true,
    bundle: false,
    outdir,
    plugins: [NodeResolvePlugin({ extensions: ['.ts', '.js'] })],
  });

  await fs.mkdir(path.join(outdir, 'helpers'), { recursive: true });

  await runScript(path.join(outdir, script, 'index.js'));
};

build();
