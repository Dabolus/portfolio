/* tslint:disable:no-implicit-dependencies object-literal-sort-keys */
// TODO: discover why we need these
/// <reference types="../typings/gulp-stylelint" />
/// <reference types="../typings/gulp-htmllint" />

import del from 'del';
import { writeFile } from 'fs';
import { dest, parallel, series, src, task } from 'gulp';
import htmllint from 'gulp-htmllint';
import stylelint from 'gulp-stylelint';
import tslint from 'gulp-tslint';
import { resolve as resolvePath } from 'path';
import { ConfigHelper } from './helpers';

/* LINTING TASKS */
task('lint:scripts', () =>
  src('src/**/*.ts')
    .pipe(tslint({
      formatter: 'verbose',
    }))
    .pipe(tslint.report({
      summarizeFailureOutput: true,
    })));

task('lint:styles', () =>
  src('src/**/*.s[ac]ss')
    .pipe(stylelint({
      failAfterError: true,
      reporters: [{
        formatter: 'string',
        console: true,
      }],
    })));

task('lint:templates', () =>
  src('src/**/*.ejs')
    .pipe(htmllint({
      failOnError: true,
    })));

task('lint', parallel('lint:scripts', 'lint:styles', 'lint:templates'));

/* BUILDING TASKS */
const configHelper = new ConfigHelper();

task('build:es5', () =>
  configHelper.createBuild('es5', 'ie > 9'));

task('build:es6', () =>
  configHelper.createBuild('es6', 'edge > 12', ['es2015']));

task('write-polymer-config', (cb) =>
  writeFile(resolvePath(__dirname, '../build/polymer.json'), configHelper.output, cb));

task('build', series(
  parallel('build:es5', 'build:es6'),
  'write-polymer-config',
));

task('firebase', () => {
  // These are the files needed by PRPL Server, that are going to be moved to the functions folder
  const filesToMove = ['build/polymer.json', 'build/**/index.html'];
  // Delete the build folder inside the functions folder
  return del('functions/build')
    .then(() =>
      // Copy the files needed by PRPL Server
      new Promise((resolve) =>
        src(filesToMove, { base: '.' })
          .pipe(dest('functions'))
          .on('end', resolve)))
    // Delete them from the original build
    .then(() => del(filesToMove));
});

task('build:firebase', series('build', 'firebase'));
