import { ParsedCertification } from '../helpers/data/certifications';
import { ParsedProject } from '../helpers/data/projects';
import { ParsedSkills } from '../helpers/data/skills';
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
  readonly certifications: readonly ParsedCertification[];
  readonly projects: readonly ParsedProject[];
  readonly skills: ParsedSkills;
}

export interface PageData {
  readonly locale: Locale;
  readonly production: boolean;
  readonly output: Output;
  readonly data: BaseData &
    Omit<Page, 'id'> & {
      readonly page: string;
      readonly age: string;
      readonly pages: Record<string, Page>;
    };
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
