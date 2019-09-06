const TelegramBot = require('node-telegram-bot-api');

const {
  env: { REPORTER_BOT_TOKEN: botToken, REPORTER_CHAT_ID: chatId },
} = process;

const bot = new TelegramBot(botToken);

export const sendMessage = content =>
  bot.sendMessage(chatId, content, {
    parse_mode: 'Markdown',
  });
