import { readConfigFile } from './data/utils';

export interface PageData extends Record<string, unknown> {
  slug?: string;
  title?: string;
  link?: string;
  description: string;
}

export interface ParsedPage extends PageData {
  id: string;
}

export interface ConfigData {
  baseTitle: string;
  baseUrl: string;
  update: {
    available: string;
    cancel: string;
    perform: string;
  };
  error: string;
  pages: Record<string, PageData>;
}

export interface ParsedConfigWithoutLocale extends Omit<ConfigData, 'pages'> {
  pages: Record<string, ParsedPage>;
}
export interface ParsedConfig extends ParsedConfigWithoutLocale {
  locale: string;
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
