const TelegramBot = require('node-telegram-bot-api');

const {
  env: { REPORTER_BOT_TOKEN: botToken, REPORTER_CHAT_ID: chatId },
} = process;

const bot = new TelegramBot(botToken);

module.exports = (content) =>
  bot.sendMessage(chatId, content, {
    parse_mode: 'Markdown',
  });
