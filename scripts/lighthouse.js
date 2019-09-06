const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const {
  env: { REPORTER_BASE_URL: baseUrl, REPORTER_PROJECT_NAME: projectName },
} = process;

const configs = [
  {
    url: '/',
    title: 'Home',
  },
  {
    url: '/about',
    title: 'About me',
  },
  {
    url: '/certifications',
    title: 'Certifications',
  },
  {
    url: '/contacts',
    title: 'Contacts',
  },
  {
    url: '/projects',
    title: 'Projects',
  },
  {
    url: '/skills',
    title: 'Skills',
  },
];

const auditPage = async (chrome, url) => {
  const {
    lhr: { categories },
  } = await lighthouse(url, { port: chrome.port });
  return categories;
};

export const audit = async () => {
  process.stdout.write('Starting Chrome...\n');
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless'],
  });

  const results = await configs.reduce(
    async (reportPromise, { url, title }) => {
      const report = await reportPromise;
      process.stdout.write(`Auditing ${title} (${baseUrl}${url})...\n`);
      const result = await auditPage(chrome, `${baseUrl}${url}`);
      return `${report}\n*${title}:*\n${Object.values(result).reduce(
        (currentReport, { title: auditTitle, score }) =>
          `${currentReport}*${auditTitle}:* \`${Math.floor(score * 100)}\`\n`,
        '',
      )}`;
    },
    Promise.resolve(`*🗼 Lighthouse report for ${projectName}:*\n`),
  );

  await chrome.kill();

  return results;
};
