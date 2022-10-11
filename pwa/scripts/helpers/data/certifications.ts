import { certifications, Certification } from '@dabolus/portfolio-data';
import { generatePicture } from './utils.js';

export interface ParsedCertification extends Omit<Certification, 'icon'> {
  readonly id: string;
  readonly picture: string;
}

export const getCertifications = async (): Promise<ParsedCertification[]> =>
  Object.entries(certifications).map(([id, { name, icon, ...data }]) => ({
    id,
    name,
    picture: generatePicture(name, icon, 112),
    ...data,
  }));
