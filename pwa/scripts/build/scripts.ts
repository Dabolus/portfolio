/// <reference types="../typings" />
import { promises as fs } from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import { BuildStylesOutput } from './styles.js';
import { computeDirname, computeTargets } from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);

export interface BuildScriptsOptions {
  readonly production: boolean;
  readonly stylesOutput: BuildStylesOutput;
}

export interface BuildScriptOutput {
  readonly fileName: string;
  readonly dependencies: readonly string[];
}

export interface BuildScriptsOutput {
  readonly main: BuildScriptOutput;
  readonly home: BuildScriptOutput;
  readonly about: BuildScriptOutput;
  readonly certifications: BuildScriptOutput;
  readonly contacts: BuildScriptOutput;
  readonly projects: BuildScriptOutput;
  readonly skills: BuildScriptOutput;
}

const scriptsPath = path.resolve(__dirname, '../../src/scripts');

const pathToPageMap: Record<string, keyof BuildScriptsOutput> = {
  main: 'main',
  'pages/home': 'home',
  'pages/about': 'about',
  'pages/certifications': 'certifications',
  'pages/contacts': 'contacts',
  'pages/projects': 'projects',
  'pages/skills': 'skills',
};

const getDependencies = (
  fileName: string,
  outputs: esbuild.Metafile['outputs'],
  transformPath = (path: string) => path,
): readonly string[] => {
  const output = outputs[fileName];

  return Array.from(
    new Set([
      ...output.imports.map((imp) => transformPath(imp.path)),
      ...output.imports.flatMap((imp) =>
        getDependencies(imp.path, outputs, transformPath),
      ),
    ]),
  );
};

const createBundle = async (
  outputPath: string,
  { production, stylesOutput }: Omit<BuildScriptsOptions, 'data'>,
): Promise<BuildScriptsOutput> => {
  const esresult = await esbuild.build({
    entryPoints: [
      path.join(scriptsPath, 'main.ts'),
      path.join(scriptsPath, 'pages/home.ts'),
      path.join(scriptsPath, 'pages/about.ts'),
      path.join(scriptsPath, 'pages/certifications.ts'),
      path.join(scriptsPath, 'pages/contacts.ts'),
      path.join(scriptsPath, 'pages/projects.ts'),
      path.join(scriptsPath, 'pages/skills.ts'),
    ],
    bundle: true,
    minify: production,
    sourcemap: production,
    treeShaking: true,
    legalComments: 'none',
    define: {
      'import.meta.env.BROWSER_ENV': `'${process.env.NODE_ENV}'`,
      'import.meta.env.ENABLE_SERVICE_WORKER': `${!!(
        production || process.env.ENABLE_SERVICE_WORKER
      )}`,
      'import.meta.env.API_URL':
        JSON.stringify(process.env.API_URL) ||
        (production ? "'/api'" : "'http://localhost:5000/api'"),
    },
    outdir: path.join(outputPath, 'scripts'),
    splitting: true,
    metafile: true,
    chunkNames: '[dir]/[name]-[hash]',
    assetNames: '[dir]/[name]-[hash]',
    entryNames: production ? '[dir]/[name]-[hash]' : '[dir]/[name]',
    target: computeTargets(),
    format: 'esm',
    // Always consider import.meta as supported, as we are
    // going to replace import.meta.env at build time
    supported: { 'import-meta': true },
  });
  const result = Object.fromEntries(
    Object.entries(esresult.metafile.outputs)
      .filter(
        ([, { entryPoint }]) =>
          entryPoint &&
          Object.keys(pathToPageMap).some((page) =>
            entryPoint.endsWith(`${page}.ts`),
          ),
      )
      .map(([key, { entryPoint }]) => [
        Object.entries(pathToPageMap).find(([page]) =>
          entryPoint?.endsWith(`${page}.ts`),
        )![1],
        {
          fileName: path.relative('../dist', key),
          dependencies: getDependencies(key, esresult.metafile.outputs, (p) =>
            path.relative('../dist', p),
          ),
        },
      ]),
  ) as unknown as BuildScriptsOutput;

  await Promise.all(
    Object.values(result).map(async ({ fileName }: BuildScriptOutput) => {
      const output = await fs.readFile(path.join(outputPath, fileName), 'utf8');

      const replacedOutput = output.replace(
        /import\.meta\.env\.(\w+)_(JS|CSS)_OUTPUT/g,
        (_, id: string, type: 'JS' | 'CSS') => {
          const map = type === 'JS' ? result : stylesOutput;

          const outputPath = map[id.toLowerCase() as keyof typeof map].fileName;

          return `'../${outputPath}'`;
        },
      );

      await fs.writeFile(
        path.join(outputPath, fileName),
        replacedOutput,
        'utf8',
      );
    }),
  );

  return result;
};

export async function buildScripts(
  outputPath: string,
  { production, stylesOutput }: BuildScriptsOptions,
): Promise<BuildScriptsOutput> {
  return createBundle(outputPath, { production, stylesOutput });
}
