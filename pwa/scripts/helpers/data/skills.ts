import path from 'node:path';
import {
  getGitHubCodeStats,
  skills,
  Skill,
  LanguageSizeData,
} from '@dabolus/portfolio-data';
import { cachePath } from '../utils.js';

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
            data-lang="${name}"
            data-size="${prettifySize(size)}"
            fill="${color || 'var(--theme-card-background)'}"
            d="M${L},${L} L${L},0 A${L},${L} 0 ${arcSweep},1 ${X}, ${Y} z"
            transform="rotate(${R}, ${L}, ${L})"
          >
            <title>${name}: ${prettifySize(size)}</title>
          </path>
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
        role="presentation"
      />
      <text
        x="${size / 2}"
        y="${size / 2}"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="var(--theme-color)"
        font-size="${size * 0.06}px"
        aria-hidden="true"
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

const computeLineChart = (data: Record<string, Skill>, size = 400) => {
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
          >
            <title>${name}: ${Math.round(score * 100)}%</title>
          </rect>
      `,
        '',
      )}
    </svg>
  `;
};

export interface GetSkillsOptions {
  cache?: boolean;
}

export const getSkills = async ({
  cache,
}: GetSkillsOptions = {}): Promise<ParsedSkills> => {
  const githubData = await getGitHubCodeStats({
    cache,
    cachePath: path.join(cachePath, 'github-skills.json'),
  });

  return {
    codeSizeChart: computePie(githubData.languages, githubData.total),
    codingSkillsChart: computeLineChart(skills.coding),
    musicSkillsChart: computeLineChart(skills.music),
    softSkillsChart: computeLineChart(skills.soft),
  };
};
