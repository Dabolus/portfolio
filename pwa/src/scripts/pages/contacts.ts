import { importRecaptcha, loadStyles, loadTemplate, sleep } from '../utils';

interface FormContent {
  readonly name?: string;
  readonly email?: string;
  readonly subject?: string;
  readonly message?: string;
  readonly 'g-recaptcha-response'?: string;
}

declare global {
  interface Window {
    __contactRecaptchaCallback: (token: string) => void;
  }
}

window.__contactRecaptchaCallback = async () => {
  const contactForm = document.querySelector<HTMLFormElement>('#contact-form');

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

  contactForm.addEventListener('mouseenter', () => importRecaptcha(), {
    once: true,
    passive: true,
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactForm.className = 'sending';
  });
};

configure();
