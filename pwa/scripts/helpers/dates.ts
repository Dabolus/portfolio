import { getAvailableLocales } from './i18n.js';

export type GetAgeFunction = (locale?: string) => string;
export type ToISODateFunction = (
  year: number,
  month: number,
  day?: number,
  locale?: string,
) => string;
export type PrettifyDateFunction = (
  year: number,
  month: number,
  day?: number,
  locale?: string,
) => string;

export interface DatesHelpers {
  readonly getAge: GetAgeFunction;
  readonly toISODate: ToISODateFunction;
  readonly prettifyDate: PrettifyDateFunction;
}

export const setupDatesHelpers = (defaultLocale: string): DatesHelpers => {
  const dateOfBirth = 873148830000; // 1st Sep 1997 at 23:20:30
  const yearLength = 31556926000; // 1 year (365 days, 5 hours, 48 minutes, and 46 seconds)
  const ageValue = (Date.now() - dateOfBirth) / yearLength;

  const dayMonthFormatter = new Intl.DateTimeFormat(defaultLocale, {
    month: 'long',
    day: 'numeric',
  });
  const monthFormatter = new Intl.DateTimeFormat(defaultLocale, {
    month: 'long',
  });

  const getAge: GetAgeFunction = (locale = defaultLocale) =>
    ageValue.toLocaleString(locale, {
      minimumFractionDigits: 9,
      maximumFractionDigits: 9,
    });

  const toISODate: ToISODateFunction = (year, month, day) =>
    `${year}-${(month || 1).toString().padStart(2, '0')}-${(day || 1)
      .toString()
      .padStart(2, '0')}`;

  const prettifyDate: PrettifyDateFunction = (year, month, day) => {
    const formatter = day ? dayMonthFormatter : monthFormatter;

    return formatter.format(new Date(toISODate(year, month, day)));
  };

  return { getAge, toISODate, prettifyDate };
};

export type DatesHelpersMap = Record<string, DatesHelpers>;

export const setupDatesHelpersMap = async (): Promise<DatesHelpersMap> => {
  const locales = await getAvailableLocales();

  const datesHelpersArray = await Promise.all(
    locales.map(async (locale) => [locale, setupDatesHelpers(locale)]),
  );

  return Object.fromEntries(datesHelpersArray);
};
