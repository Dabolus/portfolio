import TelegramBot from 'node-telegram-bot-api';

const {
  env: { REPORTER_BOT_TOKEN: botToken, REPORTER_CHAT_ID: chatId },
} = process;

const bot = new TelegramBot(botToken);

export default (report) =>
  bot.sendMediaGroup(
    chatId,
    report.map(({ title, pdf, scores }) => ({
      type: 'document',
      media: pdf,
      caption: scores
        .map(
          ({ title: auditTitle, score }) =>
            `*${auditTitle}:* \`${Math.round(score * 100)}\``,
        )
        .join('\n'),
      fileOptions: {
        filename: `${title}.pdf`,
        contentType: 'application/pdf',
      },
    })),
  );
