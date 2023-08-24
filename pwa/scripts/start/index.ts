import path from 'node:path';
import dotenv from 'dotenv';
import { computeDirname } from '../helpers/utils.js';

const __dirname = computeDirname(import.meta.url);

dotenv.config({
  path: path.join(__dirname, '../../.env'),
});

import('./run.js');
