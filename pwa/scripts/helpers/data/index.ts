import { getCertifications, ParsedCertification } from './certifications.js';
import { getProjects, ParsedProject } from './projects.js';
import { getSkills, ParsedSkills } from './skills.js';
import { getTimeline, ParsedTimelineItem } from './timeline.js';
import { getSocials, ParsedSocial } from './socials.js';

export interface Data {
  readonly certifications: readonly ParsedCertification[];
  readonly projects: readonly ParsedProject[];
  readonly skills: ParsedSkills;
  readonly timeline: readonly ParsedTimelineItem[];
  readonly socials: readonly ParsedSocial[];
}

export const getData = async (): Promise<Data> => {
  const [certifications, projects, skills, timeline, socials] =
    await Promise.all([
      getCertifications(),
      getProjects(),
      getSkills(),
      getTimeline(),
      getSocials(),
    ]);

  return {
    certifications,
    projects,
    skills,
    timeline,
    socials,
  };
};
