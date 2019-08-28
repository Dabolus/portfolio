import lozad from 'lozad';

interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly link: string;
  readonly source: string;
  readonly technologies: readonly string[];
  readonly thumbnail: string;
}

export const configure = async () => {
  const projectsContainer = document.querySelector<HTMLDivElement>('#projects');

  const res = await fetch('api/projects');
  const projects: readonly Project[] = await res.json();

  projectsContainer.innerHTML = projects.reduce(
    (projectsHtml, project) => `
    ${projectsHtml}
    <div class="project">
      <img class="lozad" src="${project.thumbnail}" data-src="${project.icon}">
      <h3>${project.name}</h3>
      <p>${project.description}</p>
      ${project.link ? `<a href="${project.link}"></a>` : ''}
      ${project.source ? `<a href="${project.source}"></a>` : ''}
      <ul>
        ${project.technologies.reduce(
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
