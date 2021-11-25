import { readConfigFile } from './utils.js';

export interface SocialData {
  readonly id: string;
  readonly name: string;
  readonly link: string;
}

export type ParsedSocial = SocialData;

export const getSocials = async (): Promise<readonly ParsedSocial[]> => {
  const socials = (await readConfigFile('socials')) as readonly SocialData[];

  return socials;
};
