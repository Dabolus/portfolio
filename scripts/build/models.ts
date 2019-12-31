export type Locale = 'en';

export interface Page {
  readonly id: string;
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
  readonly data: BaseData &
    Omit<Page, 'id'> & { readonly page: string; readonly age: string };
}

export interface LocaleData extends BaseData {
  readonly pages: readonly Page[];
}

export interface LocaleDataModule {
  readonly default: LocaleData;
}

export interface Data {
  readonly locale: Locale;
  readonly data: LocaleData;
}
