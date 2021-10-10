import { Icon, readConfigFile, generatePicture } from './utils.js';

export interface CertificationData {
  readonly name: string;
  readonly link: string;
  readonly skills: readonly string[];
  readonly icon: Icon;
}

export interface ParsedCertification extends Omit<CertificationData, 'icon'> {
  readonly id: string;
  readonly picture: string;
}

export const getCertifications = async (): Promise<ParsedCertification[]> => {
  const certifications = (await readConfigFile('certifications')) as Record<
    string,
    CertificationData
  >;

  return Object.entries(certifications).map(
    ([id, { name, icon, ...data }]) => ({
      id,
      name,
      picture: generatePicture(name, icon, 112),
      ...data,
    }),
  );
};
