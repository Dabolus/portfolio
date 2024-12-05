import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import { stringify } from 'querystring';
import { marked } from 'marked';

const recaptchaSecret = defineSecret('RECAPTCHA_SECRET');
const mailConfigJson = defineSecret('MAIL_CONFIG');

enum EmailError {
  INVALID_NAME = 'INVALID_NAME',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_SUBJECT = 'INVALID_SUBJECT',
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

interface SendEmailBody {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly message: string;
  readonly response: string;
}

const validateBody = ({
  name,
  email,
  subject,
  message,
  response,
}: SendEmailBody) => {
  if (
    typeof subject !== 'string' ||
    subject.length < 2 ||
    subject.length > 32
  ) {
    throw EmailError.INVALID_SUBJECT;
  }
  if (
    typeof message !== 'string' ||
    message.length < 2 ||
    message.length > 512
  ) {
    throw EmailError.INVALID_MESSAGE;
  }
  if (typeof response !== 'string' || !/^[\w-_]+$/.test(response)) {
    throw EmailError.INVALID_RESPONSE;
  }
  if (typeof name !== 'string' || !/^[^#&<>\"~;$^%{}?\r\n]{2,32}$/.test(name)) {
    throw EmailError.INVALID_NAME;
  }
  if (
    typeof email !== 'string' ||
    // Fully RFC 5322 compliant email regex
    // See https://stackoverflow.com/a/201378
    !/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/.test(
      email,
    )
  ) {
    throw EmailError.INVALID_EMAIL;
  }
};

const sanitize = (str: string) =>
  str.replace(
    /[&"'<>]/g,
    (char) =>
      ({
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
        '<': '&lt;',
        '>': '&gt;',
      })[char as '&' | '"' | "'" | '<' | '>'],
  );

let cachedMailTransport: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
const setupMailTransport = (): {
  from: string;
  to: string;
  transport: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
} => {
  const { from, to, host, port, username, password } = JSON.parse(
    mailConfigJson.value(),
  );

  cachedMailTransport ||= nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user: username,
      pass: password,
    },
  });

  return { from, to, transport: cachedMailTransport };
};

export const sendEmail = onRequest(
  { cors: true, secrets: [recaptchaSecret, mailConfigJson] },
  async (
    {
      body: {
        name,
        email,
        subject,
        message,
        ['g-recaptcha-response']: response,
      },
      headers: { ['Fastly-Client-IP']: remoteip },
    },
    res,
  ) => {
    try {
      validateBody({ name, email, subject, message, response });
    } catch (error) {
      res.status(400).json({ error });
      return;
    }

    try {
      const recaptchaRes = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?${stringify({
          secret: recaptchaSecret.value(),
          response,
          ...(remoteip ? { remoteip } : {}),
        })}`,
      );
      const { success } = (await recaptchaRes.json()) as { success: boolean };

      if (!success) {
        res.status(400).json({ error: EmailError.INVALID_RESPONSE });
        return;
      }

      const { from, to, transport: mailTransport } = setupMailTransport();

      await mailTransport.sendMail({
        from: `${sanitize(name)} <${from}>`,
        to,
        replyTo: email,
        subject: sanitize(subject),
        text: sanitize(message),
        html: await marked(sanitize(message)),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: EmailError.UNEXPECTED_ERROR });
      return;
    }

    res.status(204).send();
  },
);
