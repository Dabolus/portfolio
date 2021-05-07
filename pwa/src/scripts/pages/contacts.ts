import { executeCaptcha, renderCaptcha } from '../captcha';
import { loadStyles, loadTemplate, logEvent, sleep } from '../utils';

const configure = async () => {
  const [applyTemplate] = await Promise.all([
    loadTemplate('contacts'),
    loadStyles(process.env.CONTACTS_CSS_OUTPUT),
  ]);

  applyTemplate();

  const contactForm = document.querySelector<HTMLFormElement>('#contact-form');
  const contactCaptcha = contactForm.querySelector<HTMLDivElement>('.captcha');

  contactForm.addEventListener(
    'mouseenter',
    () => renderCaptcha(contactCaptcha),
    {
      once: true,
      passive: true,
    },
  );

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    contactForm.className = 'sending';

    logEvent('contact');

    await executeCaptcha(contactCaptcha);

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
  });
};

configure();
