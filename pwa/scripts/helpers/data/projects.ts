import { projects, Project } from '@dabolus/portfolio-data';
import { generatePicture, Icon, IconCategory } from './utils.js';

export interface ParsedProject extends Omit<Project, 'icon'> {
  readonly id: string;
  readonly picture: string;
}

export const getProjects = async (): Promise<ParsedProject[]> =>
  Object.entries(projects).map(([id, { name, icon, ...data }]) => ({
    id,
    name,
    picture: generatePicture(
      id,
      name,
      IconCategory.PROJECTS,
      icon as unknown as Icon,
      112,
    ),
    ...data,
  }));
