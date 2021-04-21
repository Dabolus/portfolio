import { generatePicture, Icon, loadStyles, loadTemplate } from '../utils';

interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: Icon;
  readonly link: string;
  readonly source?: string;
  readonly technologies: readonly string[];
  readonly published?: boolean;
}

const getProjects = async (): Promise<readonly Project[]> => {
  const res = await fetch(`${process.env.API_URL}/projects`);
  return res.json();
};

const configure = async () => {
  await Promise.all([
    loadTemplate('projects'),
    loadStyles(process.env.PROJECTS_CSS_OUTPUT),
  ]);

  const projectsContainer = document.querySelector<HTMLDivElement>('#projects');

  const projects = await getProjects();

  projectsContainer.innerHTML = projects.reduce(
    (
      projectsHtml,
      { id, name, description, link, source, technologies, icon },
    ) => `
    ${projectsHtml}
    <div class="project">
      ${generatePicture(name, icon, 112)}
      <div>
        <div>
          <h3>${name}</h3>
          <div>
            ${
              source
                ? `<a href="${source}" target="${id}-source">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                  </a>`
                : ''
            }
            ${
              link
                ? `<a href="${link}" target="${id}-link">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                    </svg>
                  </a>`
                : ''
            }
          </div>
        </div>
        <p>${description}</p>
        <ul class="badges">
          ${technologies.reduce(
            (technologiesHtml, technology) => `
            ${technologiesHtml}
            <li>${technology}</li>
          `,
            '',
          )}
        </ul>
      </div>
    </div>
  `,
    '',
  );
};

configure();
