import fs from 'fs-extra';
import path from 'path';
import { render } from 'ejs';
import { minify } from 'html-minifier';

export default function ejs(options = {}) {
  const {
    template,
    target,
    data = {},
    compilerOptions,
    htmlMinifierOptions,
  } = options;

  return {
    name: 'ejs',

    async generateBundle(outputOptions) {
      const targetDir = outputOptions.dir || path.dirname(outputOptions.file);

      if (!target && !template)
        throw new Error(
          '[rollup-plugin-ejs] You did not provide a template or target!',
        );

      // Get the target file name.
      const targetName = path.basename(target || template);

      // Add the file suffix if it isn't there.
      const targetFile =
        targetName.indexOf('.html') < 0 ? `${targetName}.html` : targetName;

      // Read the file
      const buffer = await fs.readFile(template);

      // Convert buffer to a string
      const source = buffer.toString('utf8');

      // Render the EJS template
      const rendered = render(source, data, {
        filename: path.resolve(template),
        ...compilerOptions,
      });

      // Minify the compiled template
      const minified = minify(rendered, htmlMinifierOptions);

      // Write the minified template to a file
      const finalTarget = path.join(targetDir, targetFile);
      await fs.ensureFile(finalTarget);
      await fs.writeFile(finalTarget, minified);
    },
  };
}
