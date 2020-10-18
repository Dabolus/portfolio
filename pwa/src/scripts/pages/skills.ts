interface SkillsData {
  skills: {
    coding: readonly LineData[];
    music: readonly LineData[];
    soft: readonly LineData[];
  };
  bytes: {
    total: number;
    languages: readonly PieData[];
  };
}

interface PieData {
  name: string;
  size: number;
}

interface LineData {
  name: string;
  score: number;
}

const skillToColor: Record<string, string> = {
  // Languages
  TypeScript: '#2b7489',
  JavaScript: '#f1e05a',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  HTML: '#e34c26',
  Less: '#1d365d',
  Go: '#00add8',
  Shell: '#89e051',
  'C++': '#f34b7d',
  Makefile: '#427819',
  C: '#555',
  'C#': '#178600',
  Python: '#3572a5',
  Rust: '#dea584',
  Dockerfile: '#384d54',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4f5d95',

  // Music
  Guitar: '#6b4a37',
  Piano: '#1c110f',
  Drums: '#873134',
  Voice: '#e5bace',
  Ukulele: '#d95030',

  // Soft skills
  'Positive attitude': '#3b5695',
  Flexibility: '#1f07ac',
  Communication: '#51eda1',
  Teamwork: '#844b1c',
  Responsibility: '#ae545f',
  Courtesy: '#4e0572',
  Integrity: '#f29349',
  'Interpersonal skills': '#528f0e',
  'Work ethic': '#de4f8e',
  Professionalism: '#f47edd',
};

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
  data: readonly PieData[],
  totalSize: number,
  size = 100,
) => {
  let R = 0;
  const L = size / 2;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttributeNS(null, 'viewBox', `0 0 ${size} ${size}`);

  const midCircle = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle',
  );
  midCircle.setAttributeNS(null, 'cx', `${size / 2}`);
  midCircle.setAttributeNS(null, 'cy', `${size / 2}`);
  midCircle.setAttributeNS(null, 'r', `${size / 3}`);
  midCircle.setAttributeNS(null, 'fill', 'var(--theme-content-background)');

  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttributeNS(null, 'x', `${size / 2}`);
  label.setAttributeNS(null, 'y', `${size / 2}`);
  label.setAttributeNS(null, 'text-anchor', 'middle');
  label.setAttributeNS(null, 'dominant-baseline', 'middle');
  label.setAttributeNS(null, 'fill', 'var(--theme-color)');
  label.setAttributeNS(null, 'font-size', '6px');

  const langName = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'tspan',
  );
  langName.setAttributeNS(null, 'x', `${size / 2}`);
  langName.setAttributeNS(null, 'dy', `-0.5em`);
  langName.textContent = 'Tap or hover a language';
  label.appendChild(langName);

  const langSize = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'tspan',
  );
  langSize.setAttributeNS(null, 'x', `${size / 2}`);
  langSize.setAttributeNS(null, 'dy', `1.5em`);
  langSize.textContent = 'to see its stats.';
  label.appendChild(langSize);

  data.forEach(({ name, size }) => {
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

    const svgSector = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path',
    );
    svgSector.setAttributeNS(
      null,
      'fill',
      skillToColor[name] || 'var(--theme-card-background)',
    );
    svgSector.setAttributeNS(
      null,
      'd',
      `M${L},${L} L${L},0 A${L},${L} 0 ${arcSweep},1 ${X}, ${Y} z`,
    );
    svgSector.setAttributeNS(null, 'transform', `rotate(${R}, ${L}, ${L})`);
    svgSector.addEventListener('mouseenter', () => {
      langName.textContent = name;
      langSize.textContent = prettifySize(size);
    });
    svgSector.addEventListener('mouseleave', () => {
      langName.textContent = 'Tap or hover a language';
      langSize.textContent = 'to see its stats.';
    });
    svg.appendChild(svgSector);

    R += a;
  });

  svg.appendChild(midCircle);
  svg.appendChild(label);

  return svg;
};

const computeLineChart = (data: readonly LineData[], size = 100) => `
  <svg viewBox="0 0 ${size} ${data.length * 7 - 2}">
    ${data.reduce(
      (lineChart, { name, score }, index) => `
        ${lineChart}
        <text
          x="0"
          y="${index * 7 + 2.5}"
          dominant-baseline="middle"
          fill="var(--theme-color)"
          font-size="4px"
        >
          ${name}
        </text>
        <rect
          fill="${skillToColor[name] || 'var(--theme-card-background)'}"
          width="${(size / 3) * 2 * score}"
          height="5"
          x="${size / 3}"
          y="${index * 7}"
        />
    `,
      '',
    )}
  </svg>
`;

const getSkills = async () => {
  const res = await fetch(`${process.env.API_URL}/skills`);
  const skills: SkillsData = await res.json();
  return skills;
};

export const configure = async () => {
  // TODO: use HTML strings instead of elements as done in other pages
  const loadingContainer = document.querySelector<HTMLDivElement>(
    '#skills > .loading-container',
  );
  const skillsContainer = document.querySelector<HTMLDivElement>(
    '#skills > .skills-container',
  );

  const {
    skills,
    bytes: { languages, total },
  } = await getSkills();

  const confidentLangsLineChart = computeLineChart(skills.coding);
  const confidentMusicLineChart = computeLineChart(skills.music);
  const confidentSoftSkillsLineChart = computeLineChart(skills.soft);
  const mostUsedLangsPie = computePie(languages, total);
  document.querySelector(
    '#most-confident-langs',
  ).innerHTML = confidentLangsLineChart;
  document.querySelector('#most-used-langs').appendChild(mostUsedLangsPie);
  document.querySelector(
    '#most-confident-music',
  ).innerHTML = confidentMusicLineChart;
  document.querySelector(
    '#most-confident-soft-skills',
  ).innerHTML = confidentSoftSkillsLineChart;

  skillsContainer.hidden = false;
  loadingContainer.hidden = true;
};

configure();
