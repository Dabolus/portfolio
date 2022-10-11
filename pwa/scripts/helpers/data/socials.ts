import { socials, Social } from '@dabolus/portfolio-data';

export interface ParsedSocial extends Social {
  readonly id: string;
}

export const getSocials = async (): Promise<readonly ParsedSocial[]> =>
  Object.entries(socials).map(([id, social]) => ({
    id,
    ...social,
  }));
