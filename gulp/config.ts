/* tslint:disable:no-implicit-dependencies */
import { exec as cbExec } from 'child_process';
import del from 'del';
import { dest, series, parallel, src, task } from 'gulp';

const exec = (cmd: string): Promise<string> =>
  new Promise((resolve, reject) => cbExec(cmd, (err, out) => {
    if (err) {
      reject(err);
    } else {
      resolve(out);
    }
  }));

task('build:es5', () =>
  exec('BUILD_NAME="es5" BROWSERSLIST="ie > 9" npm run build'));

task('build:es6', () =>
  exec('BUILD_NAME="es6" BROWSERSLIST="edge > 12" npm run build'));

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
