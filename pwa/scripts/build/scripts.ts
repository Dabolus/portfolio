/// <reference types="./typings" />
import { promises as fs } from 'fs';
import path from 'path';
import { rollup } from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import rollupBabel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
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

export interface BuildScriptsOutput {
  readonly module: BuildScriptsOutputBundle;
  readonly nomodule: BuildScriptsOutputBundle;
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

const babel = ({ modules }: { modules: boolean }) =>
  rollupBabel({
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
          ...(modules && {
            bugfixes: true,
            targets: {
              esmodules: true,
            },
          }),
        },
      ],
      '@babel/typescript',
    ],
  });

const createBundle = async (
  outputPath: string,
  { production, modules }: { production: boolean; modules: boolean },
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
      ...(modules
        ? []
        : [
            copy({
              targets: [
                // Try to copy systemjs from current node_modules directory
                {
                  src: `node_modules/systemjs/dist/s${
                    production ? '.min' : ''
                  }.js`,
                  dest: path.join(outputPath, 'nomodule'),
                },
                // If it is not there, it is most probably in the workspace root
                {
                  src: `../node_modules/systemjs/dist/s${
                    production ? '.min' : ''
                  }.js`,
                  dest: path.join(outputPath, 'nomodule'),
                },
              ],
            }),
          ]),
      resolve({
        extensions: ['.ts', '.js', '.mjs', '.styl', '.hbs'],
      }),
      commonjs(),
      babel({ modules }),
      replace({
        exclude: /node_modules/,
        delimiters: ['', ''],
        'process.env.ENABLE_DEV_SW': `${!!(
          production || process.env.ENABLE_DEV_SW
        )}`,
        'process.env.JS_DIR': modules ? "'module'" : "'nomodule'",
        'process.env.API_URL': production
          ? "'/api'"
          : "'http://localhost:5000/api'",
        'process.env.AAA': '',
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
              ...(modules && {
                module: true,
                safari10: true,
              }),
            }),
          ]
        : []),
    ],
  });

  const { output } = await rollupBuild.write({
    esModule: modules,
    entryFileNames: '[name].[hash].js',
    chunkFileNames: '[name].[hash].js',
    ...(modules
      ? {
          format: 'esm',
          dir: path.join(outputPath, 'module'),
        }
      : {
          format: 'system',
          dir: path.join(outputPath, 'nomodule'),
        }),
  });

  const result = (Object.fromEntries(
    output
      .filter(({ name }) => name in pathToPageMap)
      .map(({ name, fileName }) => [
        pathToPageMap[name] || name,
        `${modules ? 'module' : 'nomodule'}/${fileName}`,
      ]),
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
): Promise<BuildScriptsOutput> {
  const [module, nomodule] = await Promise.all([
    createBundle(outputPath, { production, modules: true }),
    createBundle(outputPath, { production, modules: false }),
  ]);

  return { module, nomodule };
}
