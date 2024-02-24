import { Data } from '../helpers/data';
import { ParsedConfig, ParsedPage } from '../helpers/config';
import { DatesHelpers } from '../helpers/dates';
import { I18nHelpers } from '../helpers/i18n';
import { StructuredDataHelpers } from '../helpers/structuredData';
import { BuildScriptsOutput } from './scripts';
import { BuildStylesOutput } from './styles';

export type Helpers = DatesHelpers & I18nHelpers & StructuredDataHelpers;

export interface PageData {
  readonly page: ParsedPage;
  readonly config: ParsedConfig;
  readonly data: Data;
  readonly helpers: Helpers;
  readonly output: Output;
  readonly buildDate: Date;
}

export interface Output {
  readonly scripts: BuildScriptsOutput;
  readonly styles: BuildStylesOutput;
}
