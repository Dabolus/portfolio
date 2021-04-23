import { getCertifications, ParsedCertification } from './certifications';
import { getProjects, ParsedProject } from './projects';
import { getSkills, ParsedSkills } from './skills';
import { getTimeline, ParsedTimelineItem } from './timeline';

export interface DynamicData {
  readonly certifications: readonly ParsedCertification[];
  readonly projects: readonly ParsedProject[];
  readonly skills: ParsedSkills;
  readonly timeline: readonly ParsedTimelineItem[];
}

export const getDynamicData = async (): Promise<DynamicData> => {
  const [certifications, projects, skills, timeline] = await Promise.all([
    getCertifications(),
    getProjects(),
    getSkills(),
    getTimeline(),
  ]);

  return {
    certifications,
    projects,
    skills,
    timeline,
  };
};
