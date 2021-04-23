import { loadStyles, loadTemplate } from '../utils';

const configure = async () => {
  await Promise.all([
    loadTemplate('projects'),
    loadStyles(process.env.PROJECTS_CSS_OUTPUT),
  ]);
};

configure();
