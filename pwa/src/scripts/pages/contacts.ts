import { importIIFE } from '../utils';

const contactForm = document.querySelector<HTMLFormElement>('#contact-form');

interface FormContent {
  readonly name?: string;
  readonly email?: string;
  readonly subject?: string;
  readonly message?: string;
  readonly 'g-recaptcha-response'?: string;
}

interface Window {
  __recaptchaCallback: (token: string) => void;
}

enum EmailError {
  INVALID_NAME = 'INVALID_NAME',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_SUBJECT = 'INVALID_SUBJECT',
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

window.__recaptchaCallback = async () => {
  try {
    const res = await fetch(`${process.env.API_URL}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(
        [...new FormData(contactForm)].reduce(
          (json, [key, value]) => ({
            ...json,
            [key]: value,
          }),
          {},
        ),
      ),
    });
    if (res.status === 204) {
      contactForm.className = 'sent';
      return;
    }

    const { error } = await res.json();
    throw new Error(error);
  } catch ({ message }) {
    alert(message);
  }
};

const configure = async () => {
  document
    .querySelector<HTMLFormElement>('#contact-form')
    .addEventListener(
      'mouseenter',
      () => importIIFE('https://www.google.com/recaptcha/api.js'),
      {
        once: true,
        passive: true,
      },
    );
};

configure();
