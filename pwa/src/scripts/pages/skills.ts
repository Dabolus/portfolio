import { loadStyles, loadTemplate } from '../utils';

export const configure = async () => {
  await Promise.all([
    loadTemplate('skills'),
    loadStyles(process.env.SKILLS_CSS_OUTPUT),
  ]);

  const languageName = document.querySelector<SVGTSpanElement>(
    '#language-name',
  );
  const languageSize = document.querySelector<SVGTSpanElement>(
    '#language-size',
  );

  document.querySelectorAll('.sector').forEach((sector) => {
    sector.addEventListener('mouseenter', () => {
      languageName.textContent = sector.getAttribute('aria-label');
      languageSize.textContent = sector.getAttribute('data-size');
    });

    sector.addEventListener('mouseleave', () => {
      languageName.textContent = 'Tap or hover a language';
      languageSize.textContent = 'to see its stats.';
    });
  });
};

configure();
