import { Data } from '../helpers/data';
import { ParsedConfig, ParsedPage } from '../helpers/config';
import { DatesHelpers } from '../helpers/dates';
import { I18nHelpers } from '../helpers/i18n';
import { BuildScriptsOutput } from './scripts';
import { BuildStylesOutput } from './styles';

export interface PageData {
  readonly page: ParsedPage;
  readonly config: ParsedConfig;
  readonly data: Data;
  readonly helpers: DatesHelpers & I18nHelpers;
  readonly output: Output;
}

export interface Output {
  readonly scripts: BuildScriptsOutput;
  readonly styles: BuildStylesOutput;
}
