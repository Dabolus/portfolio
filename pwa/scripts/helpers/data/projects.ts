import { Icon, readConfigFile, generatePicture } from './utils';

export interface ProjectData {
  readonly name: string;
  readonly description: string;
  readonly link: string;
  readonly source?: string;
  readonly technologies: readonly string[];
  readonly icon: Icon;
}

export interface ParsedProject extends Omit<ProjectData, 'icon'> {
  readonly id: string;
  readonly picture: string;
}

export const getProjects = async (): Promise<ParsedProject[]> => {
  const projects = (await readConfigFile('projects')) as Record<
    string,
    ProjectData
  >;

  return Object.entries(projects).map(([id, { name, icon, ...data }]) => ({
    id,
    name,
    picture: generatePicture(name, icon, 112),
    ...data,
  }));
};
