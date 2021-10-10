import { loadStyles, loadTemplate } from '../utils.js';

const configure = async () => {
  const [applyTemplate] = await Promise.all([
    loadTemplate('certifications'),
    loadStyles(import.meta.env.CERTIFICATIONS_CSS_OUTPUT),
  ]);

  applyTemplate();
};

configure();
