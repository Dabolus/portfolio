import fs from 'fs-extra';
import path from 'path';
import { renderSync } from 'node-sass';
import postcss from 'postcss';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
const postcssInstance = postcss([postcssPresetEnv, autoprefixer, cssnano]);

export default function sass(options = {}) {
  const { entrypoint, target, compilerOptions, postcssOptions } = options;

  return {
    name: 'sass',

    async generateBundle(outputOptions) {
      const targetDir = outputOptions.dir || path.dirname(outputOptions.file);

      if (!target && !entrypoint)
        throw new Error(
          '[rollup-plugin-sass] You did not provide an entrypoint or target!',
        );

      // Get the target file name.
      const targetFile = path.basename(target || entrypoint);

      const file = path.resolve(entrypoint);

      // Compile the Sass files
      const { css: compiled } = renderSync({
        file,
        ...compilerOptions,
      });

      // Minify the compiled Sass files
      const { css: processed } = await postcssInstance.process(
        compiled.toString(),
        {
          from: file,
          ...postcssOptions,
        },
      );

      // Write the minified entrypoint to a file
      const finalTarget = path.join(targetDir, targetFile);
      await fs.ensureFile(finalTarget);
      await fs.writeFile(finalTarget, processed);
    },
  };
}
