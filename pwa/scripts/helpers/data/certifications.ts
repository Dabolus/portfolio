import { certifications, Certification } from '@dabolus/portfolio-data';
import { generatePicture, IconCategory } from './utils.js';

export interface ParsedCertification extends Omit<Certification, 'icon'> {
  readonly id: string;
  readonly picture: string;
}

export const getCertifications = async (): Promise<ParsedCertification[]> =>
  Object.entries(certifications).map(([id, { title, icon, ...data }]) => ({
    id,
    title,
    picture: generatePicture(
      id,
      title,
      IconCategory.CERTIFICATIONS,
      icon,
      330,
      255,
    ),
    ...data,
  }));
