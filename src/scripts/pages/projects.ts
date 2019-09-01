import lozad from 'lozad';
import { supportsWebp } from '../utils';

interface ProjectIcon {
  jpg: string;
  webp: string;
  placeholder: string;
}

interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: ProjectIcon;
  readonly link: string;
  readonly source: string;
  readonly technologies: readonly string[];
}

const getProjects = async () => {
  const res = await fetch('api/projects');
  const projects: readonly Project[] = await res.json();
  return projects;
};

export const configure = async () => {
  const projectsContainer = document.querySelector<HTMLDivElement>('#projects');

  const [useWebp, projects] = await Promise.all([supportsWebp, getProjects()]);

  projectsContainer.innerHTML = projects.reduce(
    (
      projectsHtml,
      {
        name,
        description,
        link,
        source,
        technologies,
        icon: { webp, jpg, placeholder },
      },
    ) => `
    ${projectsHtml}
    <div class="project">
      <img class="lozad" src="${placeholder}" data-src="${
      useWebp ? webp : jpg
    }" alt="${name}" title="${name}">
      <h3>${name}</h3>
      <p>${description}</p>
      ${link ? `<a href="${link}"></a>` : ''}
      ${source ? `<a href="${source}"></a>` : ''}
      <ul>
        ${technologies.reduce(
          (technologiesHtml, technology) => `
          ${technologiesHtml}
          <li>${technology}</li>
        `,
          '',
        )}
      </ul>
    </div>
  `,
    '',
  );

  const observer = lozad();
  observer.observe();
};
