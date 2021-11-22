import { loadStyles, loadTemplate } from '../utils.js';

export const configure = async () => {
  const [applyTemplate] = await Promise.all([
    loadTemplate('skills'),
    loadStyles(import.meta.env.SKILLS_CSS_OUTPUT),
  ]);

  applyTemplate();

  const languageName =
    document.querySelector<SVGTSpanElement>('#language-name');
  const languageSize =
    document.querySelector<SVGTSpanElement>('#language-size');

  document.querySelectorAll('.sector').forEach((sector) => {
    sector.addEventListener('mouseenter', () => {
      languageName.textContent = sector.getAttribute('data-lang');
      languageSize.textContent = sector.getAttribute('data-size');
    });

    sector.addEventListener('mouseleave', () => {
      languageName.textContent = 'Tap or hover a language';
      languageSize.textContent = 'to see its stats.';
    });
  });
};

configure();
