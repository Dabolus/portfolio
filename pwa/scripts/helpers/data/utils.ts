import path from 'path';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';

export const readConfigFile = async (name: string) => {
  const filePath = path.join(__dirname, `../../../src/data/${name}.yml`);
  const content = await fs.readFile(filePath, 'utf8');
  return yaml.load(content);
};

export interface Icon {
  readonly svg?: string;
  readonly jpg?: string;
  readonly png?: string;
  readonly webp?: string;
  readonly placeholder: string;
}

export const generatePicture = (
  name: string,
  { svg, webp, jpg, png, placeholder }: Icon,
  size?: number,
) => `
  <picture>
    ${svg ? `<source srcset="${svg}" type="image/svg+xml">` : ''}
    ${webp ? `<source srcset="${webp}" type="image/webp">` : ''}
    ${jpg ? `<source srcset="${jpg}" type="image/jpeg">` : ''}
    ${png ? `<source srcset="${png}" type="image/jpeg">` : ''}
    <img style="background-image: url(&#34;${placeholder}&#34;);" src="${
  png || jpg || webp || svg
}" alt="${name}" title="${name}" loading="lazy" lazyload${
  size ? ` width="${size}" height="${size}"` : ''
}>
  </picture>
`;
