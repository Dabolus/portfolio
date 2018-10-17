declare module 'terser-webpack-plugin' {
  import webpack from 'webpack';

  export interface ITerserPluginConfiguration {
    cache: boolean;
    parallel: boolean;
    extractComments: boolean;
  }

  export default class TerserPlugin extends webpack.Plugin {
    constructor(config: ITerserPluginConfiguration);
  }
}
