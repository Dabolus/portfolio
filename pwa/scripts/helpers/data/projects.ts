import { projects, Project } from '@dabolus/portfolio-data';
import { generatePicture } from './utils.js';

export interface ParsedProject extends Omit<Project, 'icon'> {
  readonly id: string;
  readonly picture: string;
}

export const getProjects = async (): Promise<ParsedProject[]> =>
  Object.entries(projects).map(([id, { name, icon, ...data }]) => ({
    id,
    name,
    picture: generatePicture(name, icon, 112),
    ...data,
  }));
