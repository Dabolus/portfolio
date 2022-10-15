import path from 'path';
import fs from 'fs-extra';
import { globby } from 'globby';
import { computeDirname } from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);

export interface CopyTarget {
  from: string;
  to: string;
}

const basePath = path.resolve(__dirname, '../..');

export async function copyAssets(
  targets: readonly CopyTarget[],
): Promise<void> {
  const resolvedTargets = await Promise.all(
    targets.map(async ({ from, to }) => ({
      files: await globby(path.resolve(basePath, from), {
        expandDirectories: false,
        onlyFiles: false,
      }),
      destination: path.resolve(basePath, to),
    })),
  );

  for (const { files, destination } of resolvedTargets) {
    for (const file of files) {
      await fs.copy(file, path.resolve(destination, path.basename(file)), {
        errorOnExist: false,
        overwrite: true,
      });
    }
  }
}
