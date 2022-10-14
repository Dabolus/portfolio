import path from 'path';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import { computeDirname } from '../utils.js';

const __dirname = computeDirname(import.meta.url);

export const readConfigFile = async (name: string) => {
  const filePath = path.join(__dirname, `../../../src/data/${name}.yml`);
  const content = await fs.readFile(filePath, 'utf8');
  return yaml.load(content);
};

export enum IconFormat {
  SVG = 'svg',
  JPEG = 'jpg',
  PNG = 'png',
  PNG_PIXELATED = 'png-pixelated',
  WEBP = 'webp',
  JPEG_XL = 'jxl',
}

export enum IconCategory {
  CERTIFICATIONS = 'certifications',
  PROJECTS = 'projects',
}

const iconFormatsExtensionsExceptions: Partial<Record<IconFormat, string>> = {
  [IconFormat.PNG_PIXELATED]: 'png',
};

const iconFormatsMediaTypesExceptions: Partial<Record<IconFormat, string>> = {
  [IconFormat.PNG_PIXELATED]: 'png',
  [IconFormat.SVG]: 'svg+xml',
  [IconFormat.JPEG]: 'jpeg',
};

export interface Icon {
  readonly formats: readonly IconFormat[];
  readonly placeholder: string;
}

export const generatePicture = (
  id: string,
  name: string,
  category: IconCategory,
  { formats, placeholder }: Icon,
  size?: number,
) => `
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
      formats.includes(IconFormat.PNG_PIXELATED) ? 'class="pixelated" ' : ''
    }style="background-image: url(&#34;${placeholder}&#34;);" src="../${formats.at(
  -1,
)}" alt="${name}" title="${name}" loading="lazy" lazyload${
  size ? ` width="${size}" height="${size}"` : ''
}>
  </picture>
`;
