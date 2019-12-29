declare module 'rollup-plugin-babel';

declare module '@csstools/postcss-sass' {
  import { Options } from 'node-sass';
  import { AcceptedPlugin } from 'postcss';

  export default function(options?: Options): AcceptedPlugin;
}

declare module 'postcss-preset-env';

declare module 'workbox-build';
