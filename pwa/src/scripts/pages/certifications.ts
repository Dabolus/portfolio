import { generatePicture, Icon, loadStyles, loadTemplate } from '../utils';

interface Certification {
  readonly id: string;
  readonly name: string;
  readonly icon: Icon;
  readonly link: string;
  readonly skills: readonly string[];
  readonly published?: boolean;
}

const getCertifications = async (): Promise<readonly Certification[]> => {
  const res = await fetch(`${process.env.API_URL}/certifications`);
  return res.json();
};

const configure = async () => {
  await Promise.all([
    loadTemplate('certifications'),
    loadStyles(process.env.CERTIFICATIONS_CSS_OUTPUT),
  ]);

  const certificationsContainer = document.querySelector<HTMLDivElement>(
    '#certifications',
  );

  const certifications = await getCertifications();

  certificationsContainer.innerHTML = certifications.reduce(
    (certificationsHtml, { id, name, link, skills, icon }) => `
      ${certificationsHtml}
      <a class="certification" href="${link}" target="${id}">
        ${generatePicture(name, icon, 112)}
        <h3>${name}</h3>
        <ul class="badges">
          ${skills.reduce(
            (skillsHtml, skill) => `
            ${skillsHtml}
            <li>${skill}</li>
          `,
            '',
          )}
        </ul>
      </a>
    `,
    '',
  );
};

configure();
