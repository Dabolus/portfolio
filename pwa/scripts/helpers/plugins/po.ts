import { promises as fs } from 'node:fs';
import { Plugin } from 'esbuild';
import { parseLocaleFile } from '../i18n.js';

export interface POPluginOptions {
  readonly filter?:
    | string
    | string[]
    | RegExp
    | RegExp[]
    | ((key: string) => boolean)
    | ((key: string) => boolean)[];
}

const po = ({ filter = [] }: POPluginOptions = {}): Plugin => ({
  name: 'po',
  setup(build) {
    const filterArray = Array.isArray(filter) ? filter : [filter];
    // Load ".po" files and return a JSON file containing the po data.
    build.onLoad({ filter: /\.po$/ }, async (args) => {
      const rawContent = await fs.readFile(args.path, 'utf8');
      const parsedContent = parseLocaleFile(rawContent);
      const filteredContent = Object.fromEntries(
        Object.entries(parsedContent).filter(
          ([key]) =>
            filterArray.length < 1 ||
            filterArray.some((f) => {
              if (typeof f === 'string') {
                return key === f;
              }
              if (f instanceof RegExp) {
                return f.test(key);
              }
              return f(key);
            }),
        ),
      );
      return {
        contents: JSON.stringify(filteredContent),
        loader: 'json',
      };
    });
  },
});

export default po;
