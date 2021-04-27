import { Plugin } from 'rollup';
import { createFilter, dataToEsm } from '@rollup/pluginutils';

import { parseLocaleFile } from '../i18n';

const po = (): Plugin => {
  return {
    name: 'po',
    transform: (po, id) => {
      if (!id.endsWith('.po')) {
        return null;
      }

      return {
        code: dataToEsm(parseLocaleFile(po)),
        map: { mappings: '' },
      };
    },
  };
};

export default po;
