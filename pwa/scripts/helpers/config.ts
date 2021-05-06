import { readConfigFile } from './data/utils';

export interface PageData extends Record<string, unknown> {
  readonly slug?: string;
  readonly title?: string;
  readonly link?: string;
  readonly description: string;
}

export interface ParsedPage extends PageData {
  readonly id: string;
}

export interface ConfigData {
  readonly baseTitle: string;
  readonly baseUrl: string;
  readonly update: {
    readonly available: string;
    readonly cancel: string;
    readonly perform: string;
  };
  readonly back: string;
  readonly structuredData: {
    readonly description: string;
    readonly jobTitle: string;
    readonly address: string;
  };
  readonly availableLocales: Record<string, string>;
  readonly pages: Record<string, PageData>;
}

export interface ParsedConfigWithoutLocale extends Omit<ConfigData, 'pages'> {
  readonly pages: Record<string, ParsedPage>;
}
export interface ParsedConfig extends ParsedConfigWithoutLocale {
  readonly locale: string;
}

export const getConfig = async (): Promise<ParsedConfigWithoutLocale> => {
  const { pages, ...config } = (await readConfigFile('config')) as ConfigData;

  return {
    ...config,
    pages: Object.fromEntries(
      Object.entries(pages).map(([id, page]) => [id, { id, ...page }]),
    ),
  };
};
