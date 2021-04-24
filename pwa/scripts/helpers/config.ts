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
  locale: string;
  baseTitle: string;
  baseUrl: string;
  update: {
    available: string;
    cancel: string;
    perform: string;
  };
  pages: Record<string, PageData>;
}

export interface ParsedConfig extends Omit<ConfigData, 'pages'> {
  pages: Record<string, ParsedPage>;
}

export const getConfig = async (): Promise<ParsedConfig> => {
  const { pages, ...config } = (await readConfigFile('config')) as ConfigData;

  return {
    ...config,
    pages: Object.fromEntries(
      Object.entries(pages).map(([id, page]) => [id, { id, ...page }]),
    ),
  };
};
