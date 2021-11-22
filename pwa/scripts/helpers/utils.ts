import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

export const computeDirname = (importMetaUrl: string) =>
  dirname(fileURLToPath(importMetaUrl));

const __dirname = computeDirname(import.meta.url);

export const cachePath = resolve(__dirname, '../../node_modules/.cache/pwa');