import { importIIFE } from './utils';

declare global {
  interface Window {
    __captchaLoadedCallback: () => void;
  }
}

let captchaPromise: Promise<unknown>;

export const importCaptcha = () => {
  if (!captchaPromise) {
    captchaPromise = new Promise<void>((resolve, reject) => {
      window.__captchaLoadedCallback = resolve;
      importIIFE(
        'https://www.google.com/recaptcha/api.js?onload=__captchaLoadedCallback&render=explicit',
      ).catch(reject);
    });
  }

  return captchaPromise;
};

const captchaCache = new Map<
  HTMLElement,
  Promise<{ readonly id: number; readonly response: Promise<string> }>
>();

export const renderCaptcha = (element: HTMLElement) => {
  if (!captchaCache.has(element)) {
    captchaCache.set(
      element,
      importCaptcha().then(() => {
        let result: string;
        let error: Error;

        const response = new Promise<string>((resolve, reject) => {
          const loop = () => {
            if (result) {
              return resolve(result);
            }
            if (error) {
              return reject(error);
            }

            requestAnimationFrame(loop);
          };

          loop();
        });

        const id = grecaptcha.render(element, {
          sitekey: '6LcULLwUAAAAAE_M-jUN-D-gX2SQ4uzODS4uxneH',
          theme: 'dark',
          size: 'invisible',
          callback: (res) => {
            result = res;
          },
          'error-callback': () => {
            error = new Error();
          },
        });

        return {
          id,
          response,
        };
      }),
    );
  }

  return captchaCache.get(element);
};

export const executeCaptcha = async (element: HTMLElement) => {
  const { id, response } = await captchaCache.get(element);

  grecaptcha.execute(id);

  return response;
};

export const resetCaptcha = async (element: HTMLElement) => {
  const { id } = await captchaCache.get(element);

  grecaptcha.reset(id);
};
