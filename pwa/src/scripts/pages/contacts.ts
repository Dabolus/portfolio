import { importIIFE, loadStyles, loadTemplate, sleep } from '../utils';

interface FormContent {
  readonly name?: string;
  readonly email?: string;
  readonly subject?: string;
  readonly message?: string;
  readonly 'g-recaptcha-response'?: string;
}

declare global {
  interface Window {
    __recaptchaCallback: (token: string) => void;
  }
}

window.__recaptchaCallback = async () => {
  const contactForm = document.querySelector<HTMLFormElement>('#contact-form');

  contactForm.className = 'sending';
  const animationPromise = sleep(1500);

  try {
    const res = await fetch(`${process.env.API_URL}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(
        Object.fromEntries(Array.from(new FormData(contactForm))),
      ),
    });

    if (res.status === 204) {
      contactForm.className = 'sent';
      return;
    }

    const { error } = await res.json();
    throw new Error(error);
  } catch {
    await animationPromise;
    contactForm.className = 'errored';
  }
};

const configure = async () => {
  const [applyTemplate] = await Promise.all([
    loadTemplate('contacts'),
    loadStyles(process.env.CONTACTS_CSS_OUTPUT),
  ]);

  applyTemplate();

  const contactForm = document.querySelector<HTMLFormElement>('#contact-form');

  contactForm.addEventListener(
    'mouseenter',
    () => importIIFE('https://www.google.com/recaptcha/api.js'),
    {
      once: true,
      passive: true,
    },
  );

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
  });
};

configure();
