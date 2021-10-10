import purgeCache from './cloudflare.js';
import audit from './lighthouse.js';
import sendMessage from './telegram.js';

const postdeploy = async () => {
  try {
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
