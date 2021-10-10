import { dirname } from 'path';
import { fileURLToPath } from 'url';

export const computeDirname = (importMetaUrl: string) =>
  dirname(fileURLToPath(importMetaUrl));
