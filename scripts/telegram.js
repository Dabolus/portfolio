import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import TelegramBot from 'node-telegram-bot-api';
import { __dirname } from './utils.js';

const {
  env: {
    REPORTER_BOT_TOKEN: botToken,
    REPORTER_CHAT_ID: chatId,
    REPORTER_PROJECT_NAME: projectName,
  },
} = process;

// NOTE: this code is a good candidate to be moved into an external library
const createHeader = async (projectName) => {
  const headerTemplate = await fs.readFile(
    path.join(__dirname, 'header.svg'),
    'utf8',
  );
  const headerSvg = headerTemplate.replace(/%PROJECT_NAME%/g, projectName);
  return sharp(headerSvg).resize(512, 512).webp().toBuffer();
};

const headerPromise = createHeader(projectName);

const bot = new TelegramBot(botToken);

export default async (report) => {
  const header = await headerPromise;
  // Since the sticker is sent just to make the report prettier, there's no reason to send a notification for it
  await bot.sendSticker(chatId, header, { disable_notification: true });
  await bot.sendMediaGroup(
    chatId,
    report.map(({ title, pdf, scores }) => ({
      type: 'document',
      media: pdf,
      caption: `*${title}*\n${scores
        .map(
          ({ title: auditTitle, score }) =>
            `*${auditTitle}:* \`${Math.round(score * 100)}\``,
        )
        .join('\n')}`,
      parse_mode: 'MarkdownV2',
      fileOptions: {
        filename: `${title}.pdf`,
        contentType: 'application/pdf',
      },
    })),
  );
};
