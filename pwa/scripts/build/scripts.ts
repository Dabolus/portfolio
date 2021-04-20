/// <reference types="../typings" />
import { promises as fs } from 'fs';
import path from 'path';
import { rollup } from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import { Data } from './models';

export interface BuildScriptsOptions {
  readonly data: Data;
  readonly production: boolean;
}

export interface BuildScriptsOutputBundle {
  readonly main: string;
  readonly utils: string;
  readonly home: string;
  readonly about: string;
  readonly certifications: string;
  readonly contacts: string;
  readonly projects: string;
  readonly skills: string;
}

const scriptsPath = path.resolve(__dirname, '../../src/scripts');

const pathToPageMap: Record<string, keyof BuildScriptsOutputBundle> = {
  main: 'main',
  utils: 'utils',
  'pages/home': 'home',
  'pages/about': 'about',
  'pages/certifications': 'certifications',
  'pages/contacts': 'contacts',
  'pages/projects': 'projects',
  'pages/skills': 'skills',
};

const createBundle = async (
  outputPath: string,
  { production }: { production: boolean },
): Promise<BuildScriptsOutputBundle> => {
  const rollupBuild = await rollup({
    input: {
      main: path.join(scriptsPath, 'main.ts'),
      'pages/home': path.join(scriptsPath, 'pages/home.ts'),
      'pages/about': path.join(scriptsPath, 'pages/about.ts'),
      'pages/certifications': path.join(scriptsPath, 'pages/certifications.ts'),
      'pages/contacts': path.join(scriptsPath, 'pages/contacts.ts'),
      'pages/projects': path.join(scriptsPath, 'pages/projects.ts'),
      'pages/skills': path.join(scriptsPath, 'pages/skills.ts'),
    },
    plugins: [
      resolve({
        extensions: ['.ts', '.js', '.mjs', '.styl', '.hbs'],
      }),
      commonjs(),
      babel({
        exclude: /node_modules/,
        extensions: ['.ts', '.js', '.mjs'],
        runtimeHelpers: true,
        presets: [
          [
            '@babel/env',
            {
              loose: true,
              useBuiltIns: 'usage',
              corejs: 3,
              modules: false,
              bugfixes: true,
              targets: {
                esmodules: true,
              },
            },
          ],
          '@babel/typescript',
        ],
      }),
      replace({
        exclude: /node_modules/,
        delimiters: ['', ''],
        'process.env.ENABLE_DEV_SW': `${!!(
          production || process.env.ENABLE_DEV_SW
        )}`,
        'process.env.API_URL': production
          ? "'/api'"
          : "'http://localhost:5000/api'",
      }),
      ...(production
        ? [
            terser({
              output: {
                comments: false,
              },
              ecma: 2017,
              compress: {
                keep_fargs: false,
                passes: 3,
                booleans_as_integers: true,
                drop_console: true,
                unsafe: true,
                unsafe_comps: true,
                unsafe_Function: true,
                unsafe_math: true,
                unsafe_methods: true,
                unsafe_proto: true,
                unsafe_regexp: true,
                unsafe_undefined: true,
              },
              toplevel: true,
              module: true,
              safari10: true,
            }),
          ]
        : []),
    ],
  });

  const { output } = await rollupBuild.write({
    esModule: true,
    ...(production
      ? {
          entryFileNames: 'scripts/[name].[hash].js',
          chunkFileNames: 'scripts/[name].[hash].js',
        }
      : {
          entryFileNames: 'scripts/[name].js',
          chunkFileNames: 'scripts/[name].js',
        }),
    format: 'esm',
    dir: outputPath,
  });

  const result = (Object.fromEntries(
    output
      .filter(({ name }) => name in pathToPageMap)
      .map(({ name, fileName }) => [pathToPageMap[name] || name, fileName]),
  ) as unknown) as BuildScriptsOutputBundle;

  const mainOutput = await fs.readFile(
    path.join(outputPath, result.main),
    'utf8',
  );

  const replacedOutput = mainOutput.replace(
    /process\.env\.(\w+)_OUTPUT/g,
    (_, id) => {
      const outputPath =
        result[id.toLowerCase() as keyof BuildScriptsOutputBundle];

      return `'${outputPath.slice(outputPath.lastIndexOf('/') + 1, -3)}'`;
    },
  );

  await fs.writeFile(
    path.join(outputPath, result.main),
    replacedOutput,
    'utf8',
  );

  return result;
};

export async function buildScripts(
  outputPath: string,
  { production }: BuildScriptsOptions,
): Promise<BuildScriptsOutputBundle> {
  return createBundle(outputPath, { production });
}
