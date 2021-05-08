const lighthouse = require('lighthouse');
const puppeteer = require('puppeteer');
const { pages } = require('./utils');

const {
  env: { REPORTER_BASE_URL: baseUrl, REPORTER_PROJECT_NAME: projectName },
} = process;

const auditPage = async (port, url) => {
  const {
    lhr: { categories },
  } = await lighthouse(url, { port });
  return categories;
};

module.exports = async () => {
  process.stdout.write('Starting Chrome...\n');
  const chrome = await puppeteer.launch();
  const { port } = new URL(chrome.wsEndpoint());

  const results = await pages.reduce(async (reportPromise, { url, title }) => {
    const report = await reportPromise;
    process.stdout.write(`Auditing ${title} (${baseUrl}${url})...\n`);
    const result = await auditPage(port, `${baseUrl}${url}`);
    return `${report}\n*${title}:*\n${Object.values(result).reduce(
      (currentReport, { title: auditTitle, score }) =>
        `${currentReport}*${auditTitle}:* \`${Math.floor(score * 100)}\`\n`,
      '',
    )}`;
  }, Promise.resolve(`*🗼 Lighthouse report for ${projectName}:*\n`));

  await chrome.close();

  return results;
};
