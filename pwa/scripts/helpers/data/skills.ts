import fetch from 'node-fetch';
import { readConfigFile } from './utils';

export interface LanguageSizeData {
  readonly name: string;
  readonly size: string;
  readonly color: string;
}

export interface GitHubData {
  readonly total: string;
  readonly languages: readonly LanguageSizeData[];
}

export interface SkillData {
  readonly score: number;
  readonly color?: string;
}

export interface SkillsData {
  readonly coding: Record<string, SkillData>;
  readonly music: Record<string, SkillData>;
  readonly soft: Record<string, SkillData>;
}

export interface ParsedSkill extends Omit<SkillData, 'color'> {
  readonly name: string;
  readonly color: string;
}

export interface ParsedSkills {
  readonly bytes: GitHubData;
  readonly skills: {
    readonly coding: readonly ParsedSkill[];
    readonly music: readonly ParsedSkill[];
    readonly soft: readonly ParsedSkill[];
  };
}

const prettifySize = (bytes: number) => {
  const measurementUnits = ['B', 'kB', 'MB', 'GB'];
  let finalVal = bytes;
  let unitIndex = 0;
  while (finalVal > 1024) {
    finalVal /= 1024;
    unitIndex++;
  }
  return `≈${Math.round(finalVal)}${measurementUnits[unitIndex]}`;
};

const getGithubData = async (
  codingSkillsData: Record<string, SkillData>,
): Promise<GitHubData> => {
  const request = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      query: `
          query {
            viewer {
              repositories(first: 100) {
                nodes {
                  languages(first: 100) {
                    edges {
                      node {
                        name
                      }
                      size
                    }
                    totalSize
                  }
                }
              }
            }
          }
        `,
    }),
  });

  const response = await request.json();

  const { total, languages } = response.data.viewer.repositories.nodes.reduce(
    (acc: any, repo: any) => ({
      ...acc,
      total: (acc.total || 0) + repo.languages.totalSize,
      languages: {
        ...acc.languages,
        ...repo.languages.edges.reduce(
          (languages: any, language: any) => ({
            ...languages,
            [language.node.name]: {
              ...acc.languages[language.node.name],
              color: language.node.color,
              size:
                ((acc.languages[language.node.name] || {}).size || 0) +
                language.size,
            },
          }),
          {},
        ),
      },
    }),
    { total: 0, languages: {} },
  );

  return {
    total: prettifySize(total),
    languages: Object.entries(languages).reduce(
      (languageArr: any, [name, { color, size }]: [string, any]) => {
        const index = languageArr.findIndex(
          (language: any) => language.size < size,
        );
        const newElemIndex = index < 0 ? languageArr.length : index;
        const firstSlice = languageArr.slice(0, newElemIndex);
        const secondSlice = languageArr.slice(newElemIndex);

        return [
          ...firstSlice,
          {
            name,
            size: prettifySize(size),
            color:
              color ||
              codingSkillsData[name]?.color ||
              'var(--theme-card-background)',
          },
          ...secondSlice,
        ];
      },
      [],
    ),
  };
};

const parseSkills = (
  skillsData: Record<string, SkillData>,
): readonly ParsedSkill[] =>
  Object.entries(skillsData)
    .filter(([, { color }]) => !!color)
    .map(
      ([name, data]) =>
        ({
          name,
          ...data,
        } as ParsedSkill),
    );

export const getSkills = async (): Promise<ParsedSkills> => {
  const skillsData = (await readConfigFile('skills')) as SkillsData;
  const bytes = await getGithubData(skillsData.coding);

  return {
    skills: {
      coding: parseSkills(skillsData.coding),
      music: parseSkills(skillsData.music),
      soft: parseSkills(skillsData.soft),
    },
    bytes,
  };
};
