import TelegramBot from 'node-telegram-bot-api';

const {
  env: { REPORTER_BOT_TOKEN: botToken, REPORTER_CHAT_ID: chatId },
} = process;

const bot = new TelegramBot(botToken);

export default (report) =>
  bot.sendMediaGroup(
    chatId,
    report.map(({ title, pdf, thumbnail }) => ({
      type: 'document',
      media: pdf,
      thumb: thumbnail,
      fileOptions: {
        filename: `${title}.pdf`,
      },
    })),
  );
