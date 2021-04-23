import { getCertifications, ParsedCertification } from './certifications';
import { getProjects, ParsedProject } from './projects';
import { getSkills, ParsedSkills } from './skills';

export interface DynamicData {
  readonly certifications: readonly ParsedCertification[];
  readonly projects: readonly ParsedProject[];
  readonly skills: ParsedSkills;
}

export const getDynamicData = async (): Promise<DynamicData> => {
  const [certifications, projects, skills] = await Promise.all([
    getCertifications(),
    getProjects(),
    getSkills(),
  ]);

  return {
    certifications,
    projects,
    skills,
  };
};
