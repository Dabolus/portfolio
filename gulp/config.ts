/* tslint:disable:no-implicit-dependencies */
import { exec } from 'child_process';
import del from 'del';
import { dest, parallel, series, src, task } from 'gulp';

task('build:es5', (cb) =>
  exec('BUILD_NAME="es5" BROWSERSLIST="ie > 9" npm run build', cb));

task('build:es6', (cb) =>
  exec('BUILD_NAME="es6" BROWSERSLIST="edge > 12" npm run build', cb));

task('build', parallel('build:es5', 'build:es6'));

task('firebase', () => {
  // These are the files needed by PRPL Server, that are going to be moved to the functions folder
  const filesToMove = 'build/**/index.html';
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
