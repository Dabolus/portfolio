import { saveAs } from 'file-saver';

import { startAnimation, stopAnimation } from '../animation';
import { executeCaptcha, renderCaptcha, resetCaptcha } from '../captcha';
import { loadStyles, loadTemplate } from '../utils';

// Configure age animation
const dateOfBirth = 873148830000; // 1st Sep 1997 at 23:20:30
const yearLength = 31556926000; // 1 year (365 days, 5 hours, 48 minutes, and 46 seconds)

const updateAge = (age: HTMLSpanElement) => () => {
  stopAnimation('age');
  // TODO: decide whether to use actual years or Gregorian calendar years (in that case we would have 365.2425 days per year)
  // Interesting links and papers:
  // - https://pumas.jpl.nasa.gov/files/04_21_97_1.pdf
  // - https://www.grc.nasa.gov/WWW/k-12/Numbers/Math/Mathematical_Thinking/calendar_calculations.htm
  age.textContent = ((Date.now() - dateOfBirth) / yearLength).toLocaleString(
    'en', // TODO: use current locale
    {
      minimumFractionDigits: 9,
      maximumFractionDigits: 9,
    },
  );

  startAnimation('age', updateAge(age));
};

const configure = async () => {
  const [applyTemplate] = await Promise.all([
    loadTemplate('about'),
    loadStyles(process.env.ABOUT_CSS_OUTPUT),
  ]);

  applyTemplate();

  const resumeForm = document.querySelector<HTMLFormElement>('#resume-form');
  const getResumeCaptcha = resumeForm.querySelector<HTMLDivElement>('.captcha');
  const getResumeButton = resumeForm.querySelector<HTMLButtonElement>('button');
  const getResumeLoading = getResumeButton.querySelector<HTMLDivElement>(
    '.loading',
  );
  const resumeError = resumeForm.querySelector<HTMLSpanElement>(
    '#resume-error',
  );

  resumeForm.addEventListener(
    'mouseenter',
    () => renderCaptcha(getResumeCaptcha),
    {
      once: true,
      passive: true,
    },
  );

  resumeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    resumeError.hidden = true;
    getResumeButton.disabled = true;
    getResumeLoading.hidden = false;

    await executeCaptcha(getResumeCaptcha);

    try {
      const res = await fetch(`${process.env.API_URL}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(
          Object.fromEntries(Array.from(new FormData(resumeForm))),
        ),
      });

      if (res.status !== 200) {
        throw new Error();
      }

      const resumeBlob = await res.blob();

      saveAs(resumeBlob, 'Giorgio Garasto - Resume.pdf');
    } catch {
      resumeError.hidden = false;
    }

    getResumeLoading.hidden = true;
    getResumeButton.disabled = false;

    resetCaptcha(getResumeCaptcha);
  });
};

const configurationPromise = configure();

export const onPageLoad = async () => {
  await configurationPromise;

  startAnimation(
    'age',
    updateAge(document.querySelector<HTMLSpanElement>('#age')),
  );
};

export const onPageUnload = () => {
  stopAnimation('age');
};
