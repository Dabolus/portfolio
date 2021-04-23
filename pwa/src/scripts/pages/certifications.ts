import { loadStyles, loadTemplate } from '../utils';

const configure = async () => {
  const [applyTemplate] = await Promise.all([
    loadTemplate('certifications'),
    loadStyles(process.env.CERTIFICATIONS_CSS_OUTPUT),
  ]);

  applyTemplate();
};

configure();
