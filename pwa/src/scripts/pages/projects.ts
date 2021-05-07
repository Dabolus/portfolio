import { loadStyles, loadTemplate } from '../utils';

const configure = async () => {
  const [applyTemplate] = await Promise.all([
    loadTemplate('projects'),
    loadStyles(import.meta.env.PROJECTS_CSS_OUTPUT),
  ]);

  applyTemplate();
};

configure();
