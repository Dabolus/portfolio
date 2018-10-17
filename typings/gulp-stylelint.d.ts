declare module 'gulp-stylelint' {
  export type GulpStylelintFormatter = 'string' | 'verbose' | 'json';

  export interface IGulpStylelintReporter {
    formatter: GulpStylelintFormatter;
    save?: string;
    console?: boolean;
  }

  export interface IGulpStylelintOptions {
    failAfterError?: boolean;
    reportOutputDir?: string;
    reporters?: IGulpStylelintReporter[];
    debug?: boolean;
    fix?: boolean;
  }

  export default function GulpStylelint(options?: IGulpStylelintOptions): any;
}
