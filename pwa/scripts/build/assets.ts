import path from 'path';
import fs from 'fs-extra';
import globby from 'globby';

export interface CopyTarget {
  from: string;
  to: string;
}

const basePath = path.resolve(__dirname, '../..');

export async function copyAssets(
  targets: readonly CopyTarget[],
): Promise<void> {
  await Promise.all(
    targets.map(async ({ from, to }) => {
      const files = await globby(path.join(basePath, from), {
        expandDirectories: false,
        onlyFiles: false,
      });

      const destinationPath = path.join(basePath, to);

      await Promise.all(
        files.map((file) =>
          fs.copy(file, path.join(destinationPath, path.basename(file))),
        ),
      );
    }),
  );
}
