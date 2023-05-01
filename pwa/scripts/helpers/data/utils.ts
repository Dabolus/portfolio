import path from 'path';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import { Icon, IconFormat } from '@dabolus/portfolio-data';
import { computeDirname } from '../utils.js';

const __dirname = computeDirname(import.meta.url);

export const readConfigFile = async (name: string) => {
  const filePath = path.join(__dirname, `../../../src/data/${name}.yml`);
  const content = await fs.readFile(filePath, 'utf8');
  return yaml.load(content);
};

export enum IconCategory {
  CERTIFICATIONS = 'certifications',
  PROJECTS = 'projects',
}

const iconFormatsExtensionsExceptions: Partial<Record<IconFormat, string>> = {
  [IconFormat.PNG_PIXELATED]: 'png',
  [IconFormat.GIF_PIXELATED]: 'gif',
};

const iconFormatsMediaTypesExceptions: Partial<Record<IconFormat, string>> = {
  [IconFormat.PNG_PIXELATED]: 'png',
  [IconFormat.GIF_PIXELATED]: 'gif',
  [IconFormat.SVG]: 'svg+xml',
  [IconFormat.JPEG]: 'jpeg',
};

export const generatePicture = (
  id: string,
  name: string,
  category: IconCategory,
  { formats, placeholder }: Icon,
  width?: number,
  height = width,
) => {
  const fallbackFormat = formats.at(-1);

  return `
    <picture>
      ${formats
        .map(
          (format) =>
            `<source srcset="../images/${category}/${id}.${
              iconFormatsExtensionsExceptions[format] || format
            }" type="image/${
              iconFormatsMediaTypesExceptions[format] || format
            }">`,
        )
        .join('')}
      <img ${
        fallbackFormat === IconFormat.PNG_PIXELATED ||
        fallbackFormat === IconFormat.GIF_PIXELATED
          ? 'class="pixelated" '
          : ''
      }style="background-image: url(&#34;${placeholder}&#34;);" src="../images/${category}/${id}.${
    iconFormatsExtensionsExceptions[fallbackFormat] || fallbackFormat
  }" alt="${name}" title="${name}" loading="lazy" lazyload${
    width ? ` width="${width}" height="${height}"` : ''
  }>
    </picture>
  `;
};
