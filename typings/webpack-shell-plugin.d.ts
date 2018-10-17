declare module 'webpack-shell-plugin' {
  import webpack from 'webpack';

  export interface IWebpackShellPluginConfig {
    onBuildStart?: string[];
    onBuildEnd?: string[];
  }

  export default class ScriptExtHtmlWebpackPlugin extends webpack.Plugin {
    constructor(options: IWebpackShellPluginConfig);
  }
}
