import { BuildScriptsOutput } from './scripts';
import { BuildStylesOutput } from './styles';

export type Locale = 'en';

export interface Page {
  readonly title?: string;
  readonly description: string;
  readonly [key: string]: unknown;
}

export interface BaseData {
  readonly baseTitle: string;
  readonly baseUrl: string;
}

export interface PageData {
  readonly locale: Locale;
  readonly production: boolean;
  readonly output: Output;
  readonly data: BaseData &
    Omit<Page, 'id'> & { readonly page: string; readonly age: string };
}

export interface LocaleData extends BaseData {
  readonly pages: Record<string, Page>;
}

export interface LocaleDataModule {
  readonly default: LocaleData;
}

export interface Data {
  readonly locale: Locale;
  readonly data: LocaleData;
}

export interface Output {
  readonly scripts: BuildScriptsOutput;
  readonly styles: BuildStylesOutput;
}
