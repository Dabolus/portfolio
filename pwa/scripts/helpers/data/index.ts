import { getCertifications, ParsedCertification } from './certifications.js';
import { getProjects, ParsedProject } from './projects.js';
import { getSkills, ParsedSkills } from './skills.js';
import { getTimeline, ParsedTimelineItem } from './timeline.js';

export interface Data {
  readonly certifications: readonly ParsedCertification[];
  readonly projects: readonly ParsedProject[];
  readonly skills: ParsedSkills;
  readonly timeline: readonly ParsedTimelineItem[];
}

export const getData = async (): Promise<Data> => {
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
