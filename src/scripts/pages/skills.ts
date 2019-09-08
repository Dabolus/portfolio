interface PieData {
  name: string;
  size: number;
  color?: string;
}

const prettifySize = (bytes: number) => {
  const measurementUnits = ['B', 'kB', 'MB', 'GB'];
  let finalVal = bytes;
  let unitIndex = 0;
  while (finalVal > 1024) {
    finalVal /= 1024;
    unitIndex++;
  }
  return `~${Math.round(finalVal)}${measurementUnits[unitIndex]}`;
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
  label.setAttributeNS(null, 'font-size', '45%');

  const langName = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'tspan',
  );
  langName.setAttributeNS(null, 'x', `${size / 2}`);
  langName.setAttributeNS(null, 'dy', `-0.5em`);
  langName.textContent = 'Tap on a language';
  label.appendChild(langName);

  const langSize = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'tspan',
  );
  langSize.setAttributeNS(null, 'x', `${size / 2}`);
  langSize.setAttributeNS(null, 'dy', `1.5em`);
  langSize.textContent = 'to see its stats.';
  label.appendChild(langSize);

  data.forEach(({ name, size, color }) => {
    const a = 360 * (size / totalSize);
    const aCalc = a > 180 ? 360 - a : a;
    const aRad = (aCalc * Math.PI) / 180;
    const z = Math.sqrt(2 * L * L - 2 * L * L * Math.cos(aRad));
    const x =
      aCalc <= 90
        ? L * Math.sin(aRad)
        : L * Math.sin(((180 - aCalc) * Math.PI) / 180);
    const y = Math.sqrt(z * z - x * x);
    const Y = y;
    const [X, arcSweep] = a <= 180 ? [L + x, 0] : [L - x, 1];

    const svgSector = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path',
    );
    svgSector.setAttributeNS(
      null,
      'fill',
      color || 'var(--theme-card-background)',
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
    svg.appendChild(svgSector);

    R += a;
  });

  svg.appendChild(midCircle);
  svg.appendChild(label);

  return svg;
};

export const configure = () => {
  console.log('test');
};
