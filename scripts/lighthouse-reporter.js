const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const TelegramBot = require('node-telegram-bot-api');

const {
  env: {
    REPORTER_BASE_URL: baseUrl,
    REPORTER_BOT_TOKEN: botToken,
    REPORTER_CHAT_ID: chatId,
    REPORTER_PROJECT_NAME: projectName,
  },
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

const audit = async (chrome, url) => {
  const {
    lhr: { categories },
  } = await lighthouse(url, { port: chrome.port });
  return categories;
};

const auditAll = async () => {
  process.stdout.write('Starting Chrome...\n');
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless'],
  });

  const results = await configs.reduce(
    async (reportPromise, { url, title }) => {
      const report = await reportPromise;
      process.stdout.write(`Auditing ${title} (${baseUrl}${url})...\n`);
      const result = await audit(chrome, `${baseUrl}${url}`);
      return `${report}\n*${title}:*\n${Object.values(result).reduce(
        (currentReport, { title: auditTitle, score }) =>
          `${currentReport}*${auditTitle}:* \`${Math.floor(score * 100)}\`\n`,
        '',
      )}`;
    },
    Promise.resolve(`*Lighthouse report for ${projectName}:*\n`),
  );

  await chrome.kill();

  return results;
};

const sendTelegramMessage = async content => {
  const bot = new TelegramBot(botToken);
  await bot.sendMessage(chatId, content, {
    parse_mode: 'Markdown',
  });
};

auditAll()
  .then(report => {
    process.stdout.write('Sending report to Telegram...\n');
    return sendTelegramMessage(report);
  })
  .then(() => {
    process.stdout.write('Report successfully sent to Telegram.\n');
    process.exit(0);
  })
  .catch(({ message }) => {
    process.stderr.write(
      `Error while generating Lighthouse report!\n\n${message}\n`,
    );
    process.exit(1);
  });
