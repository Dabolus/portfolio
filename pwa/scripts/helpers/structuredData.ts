import { ParsedConfig } from './config';
import { I18nHelpers } from './i18n';

export type GenerateStructuredDataOptions = {
  readonly config: ParsedConfig;
  readonly helpers: I18nHelpers;
};

export type GenerateStructuredDataFunction = (
  options: GenerateStructuredDataOptions,
) => string;

export interface StructuredDataHelpers {
  readonly generateStructuredData: GenerateStructuredDataFunction;
}

export const generateStructuredData: GenerateStructuredDataFunction = ({
  config,
  helpers,
}) =>
  JSON.stringify([
    {
      '@context': 'http://schema.org/',
      '@type': 'Person',
      url: config.baseUrl,
      image: `${config.baseUrl}/images/propic.jpg`,
      name: 'Dabolus',
      givenName: 'Giorgio',
      familyName: 'Garasto',
      gender: {
        '@type': 'GenderType',
        name: 'Male',
      },
      email: 'giorgio@garasto.me',
      nationality: {
        '@type': 'Country',
        name: 'IT',
      },
      description: helpers.translate(config.structuredData.description),
      jobTitle: helpers.translate(config.structuredData.jobTitle),
      worksFor: {
        '@type': 'Organization',
        name: 'Empatica',
        address: helpers.translate(config.structuredData.address),
      },
      sameAs: [
        'https://www.linkedin.com/in/giorgiogarasto',
        'https://github.com/Dabolus',
        'https://twitter.com/Dabolus',
        'https://fb.me/giorgio.garasto',
        'https://t.me/Dabolus',
      ],
    },
  ]);
