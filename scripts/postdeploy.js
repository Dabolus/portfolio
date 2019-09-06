const { purgeCache } = require('./cloudflare');
const { audit } = require('./lighthouse');
const { sendMessage } = require('./telegram');

const postdeploy = async () => {
  try {
    process.stdout.write('Purging CloudFlare cache...\n');
    await purgeCache();

    const report = await audit();

    process.stdout.write('Sending report to Telegram...\n');
    await sendMessage(report);

    process.stdout.write('Report successfully sent to Telegram.\n');
    process.exit(0);
  } catch ({ message }) {
    process.stderr.write(
      `Error while generating Lighthouse report!\n\n${message}\n`,
    );
    process.exit(1);
  }
};

postdeploy();
