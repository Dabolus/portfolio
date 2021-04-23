import { loadStyles, loadTemplate } from '../utils';

const configure = async () => {
  await Promise.all([
    loadTemplate('certifications'),
    loadStyles(process.env.CERTIFICATIONS_CSS_OUTPUT),
  ]);
};

configure();
