import purgeCache from './cloudflare.js';
import audit from './lighthouse.js';
// import sendDocuments from './telegram.js';

const postdeploy = async (): Promise<void> => {
  try {
    await purgeCache();

    const report = await audit();

    console.log(
      report
        .map(
          ({ title, scores }) =>
            `${title}\n${scores
              .map((category) => `${category.title}: ${category.score}`)
              .join('\n')}`,
        )
        .join('\n\n'),
    );

    // console.log('Sending report to Telegram...');
    // await sendDocuments(report);

    // console.log('Report successfully sent to Telegram.');
    process.exit(0);
  } catch (error) {
    console.error('Error while generating Lighthouse report!', error);
    process.exit(1);
  }
};

postdeploy();
