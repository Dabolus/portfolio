import { promises as fs } from 'fs';
import path from 'path';
import { buildTemplate } from './templates';
import { buildScripts } from './scripts';
import { buildStyles } from './styles';
import { generateServiceWorkers } from './sw';
import { copyAssets } from './assets';

const outputPath = path.resolve(__dirname, '../../dist');
const localesPath = path.resolve(__dirname, '../../src/locales');

const getLocalesData = async () => {
  const locales = await fs.readdir(localesPath);
  const localesData = await Promise.all(
    locales.map(async localeFile => {
      const locale = localeFile.slice(0, 2);
      const localePath = path.resolve(localesPath, localeFile);
      const { default: data } = await import(localePath);

      return { locale, data };
    }),
  );

  return localesData;
};

const build = async () => {
  const localesData = await getLocalesData();
  const production = process.env.NODE_ENV === 'production';

  await Promise.all([
    ...localesData.map(data =>
      buildTemplate(path.resolve(outputPath, data.locale), {
        data,
        production,
      }),
    ),
    buildScripts(outputPath, { production, data: {} }),
    buildStyles(outputPath, { data: {} }),
    copyAssets([
      {
        from: 'src/assets/*',
        to: 'dist',
      },
      {
        from: `node_modules/systemjs/dist/s${production ? '.min' : ''}.js`,
        to: 'dist/nomodule',
      },
    ]),
  ]);
  await generateServiceWorkers(outputPath);
};

build();
