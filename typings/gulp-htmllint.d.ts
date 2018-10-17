declare module 'gulp-htmllint' {
  export interface IGulpHtmllintOptions {
    rules?: any;
    config?: string;
    plugins?: string[];
    failOnError?: boolean;
  }

  export interface IGulpHtmllintReporter {
    filepath: string;
    issues: string[];
  }

  export default function GulpHtmllint(
    options?: IGulpHtmllintOptions,
    customReporter?: IGulpHtmllintReporter,
  ): any;
}
