import { importRecaptcha, loadStyles, loadTemplate, sleep } from '../utils';

const configure = async () => {
  const [applyTemplate] = await Promise.all([
    loadTemplate('contacts'),
    loadStyles(process.env.CONTACTS_CSS_OUTPUT),
  ]);

  applyTemplate();

  const contactForm = document.querySelector<HTMLFormElement>('#contact-form');
  const contactSubmitButton = contactForm.querySelector<HTMLButtonElement>(
    'button',
  );

  contactForm.addEventListener(
    'mouseenter',
    async () => {
      await importRecaptcha();
      grecaptcha.render(contactSubmitButton, {
        sitekey: '6LcULLwUAAAAAE_M-jUN-D-gX2SQ4uzODS4uxneH',
        theme: 'dark',
        callback: async () => {
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
        },
      });
    },
    {
      once: true,
      passive: true,
    },
  );

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactForm.className = 'sending';
  });
};

configure();
