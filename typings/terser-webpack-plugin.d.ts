declare module 'terser-webpack-plugin' {
  export interface TerserPluginConfiguration {
    cache: boolean;
    parallel: boolean;
    extractComments: boolean;
  }

  export default class TerserPlugin {
    constructor(config: TerserPluginConfiguration);
  }
}
