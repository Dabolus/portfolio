const path = require('path');
const childProcess = require('child_process');

module.exports.entryPoint = path.join(__dirname, '../src/index.ts');

module.exports.outDir = path.join(__dirname, '../lib');

module.exports.typeCheck = () =>
  new Promise((resolve, reject) =>
    childProcess.exec(`tsc -p tsconfig.json`, (error, stdout) =>
      error ? reject(stdout) : resolve(),
    ),
  );
