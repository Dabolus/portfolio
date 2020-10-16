/// <reference types="./typings" />
import path from 'path';
import { rollup } from 'rollup';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import rollupBabel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import { Data } from './models';

const scriptsPath = path.resolve(__dirname, '../../src/scripts');

const babel = ({ modules }: { modules: boolean }) =>
  rollupBabel({
    exclude: 'node_modules/**',
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
) => {
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
                {
                  src: `node_modules/systemjs/dist/s${
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
        exclude: 'node_modules/**',
        delimiters: ['', ''],
        'process.env.ENABLE_DEV_SW': `${!!(
          production || process.env.ENABLE_DEV_SW
        )}`,
        'process.env.JS_DIR': modules ? "'module'" : "'nomodule'",
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

  await rollupBuild.write({
    esModule: modules,
    chunkFileNames: '[name].js',
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
};

export interface BuildScriptsOptions {
  readonly data: Data;
  readonly production: boolean;
}

export async function buildScripts(
  outputPath: string,
  { production }: BuildScriptsOptions,
): Promise<void> {
  await Promise.all([
    createBundle(outputPath, { production, modules: true }),
    createBundle(outputPath, { production, modules: false }),
  ]);
}
