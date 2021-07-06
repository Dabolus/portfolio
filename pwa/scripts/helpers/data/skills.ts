import fetch from 'node-fetch';
import { readConfigFile } from './utils';

export interface LanguageSizeData {
  readonly name: string;
  readonly size: number;
  readonly color: string;
}

export interface GitHubData {
  readonly total: number;
  readonly languages: readonly LanguageSizeData[];
}

export interface SkillData {
  readonly score?: number;
  readonly color: string;
}

export interface SkillsData {
  readonly coding: Record<string, SkillData>;
  readonly music: Record<string, SkillData>;
  readonly soft: Record<string, SkillData>;
}

export interface ParsedSkills {
  readonly codeSizeChart: string;
  readonly codingSkillsChart: string;
  readonly musicSkillsChart: string;
  readonly softSkillsChart: string;
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
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
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
    total,
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
            size,
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

const computePie = (
  data: readonly LanguageSizeData[],
  totalSize: number,
  size = 400,
) => {
  let R = 0;
  const L = size / 2;

  return `
    <svg viewBox="0 0 ${size} ${size}">
      ${data.reduce((sectors, { name, size, color }) => {
        const a = 360 * (size / totalSize);
        const aCalc = a > 180 ? 360 - a : a;
        const aRad = (aCalc * Math.PI) / 180;
        const z = Math.sqrt(2 * L * L - 2 * L * L * Math.cos(aRad));
        const x =
          aCalc <= 90
            ? L * Math.sin(aRad)
            : L * Math.sin(((180 - aCalc) * Math.PI) / 180);
        const y = Math.sqrt(Math.max(0, z * z - x * x));
        const Y = y;
        const [X, arcSweep] = a <= 180 ? [L + x, 0] : [L - x, 1];

        const path = `
          <path
            class="sector"
            aria-label="${name}"
            data-size="${prettifySize(size)}"
            fill="${color || 'var(--theme-card-background)'}"
            d="M${L},${L} L${L},0 A${L},${L} 0 ${arcSweep},1 ${X}, ${Y} z"
            transform="rotate(${R}, ${L}, ${L})"
          />
        `;

        R += a;

        return `
          ${sectors}
          ${path}
        `;
      }, '')}
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${size / 3}"
        fill="var(--theme-content-background)"
      />
      <text
        x="${size / 2}"
        y="${size / 2}"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--theme-color)"
        font-size="${size * 0.06}px"
      >
        <tspan id="language-name" x="${
          size / 2
        }" dy="-0.5em">Tap or hover a language</tspan>
        <tspan id="language-size" x="${
          size / 2
        }" dy="1.5em">to see its stats.</tspan>
      </text>
    </svg>
  `;
};

const computeLineChart = (data: Record<string, SkillData>, size = 400) => {
  const entries = Object.entries(data).filter(([, { score }]) => !!score);

  return `
    <svg viewBox="0 0 ${size} ${((entries.length * 7 - 2) / 100) * size}">
      ${entries.reduce(
        (lineChart, [name, { score, color }], index) => `
          ${lineChart}
          <text
            x="0"
            y="${((index * 7 + 2.5) / 100) * size}"
            dominant-baseline="middle"
            fill="var(--theme-color)"
            font-size="${size * 0.04}px"
          >
            ${name}
          </text>
          <rect
            fill="${color || 'var(--theme-card-background)'}"
            width="${(size / 3) * 2 * score}"
            height="${size * 0.05}"
            x="${size / 3}"
            y="${((index * 7) / 100) * size}"
          />
      `,
        '',
      )}
    </svg>
  `;
};

export const getSkills = async (): Promise<ParsedSkills> => {
  const skillsData = (await readConfigFile('skills')) as SkillsData;
  const { languages, total } = await getGithubData(skillsData.coding);

  return {
    codeSizeChart: computePie(languages, total),
    codingSkillsChart: computeLineChart(skillsData.coding),
    musicSkillsChart: computeLineChart(skillsData.music),
    softSkillsChart: computeLineChart(skillsData.soft),
  };
};
