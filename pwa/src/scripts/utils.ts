export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const scroll = ({
  smooth = true,
  val,
}: {
  smooth?: boolean;
  val?: number;
} = {}) => {
  const scrollingElement =
    document.scrollingElement || document.documentElement;
  const y = typeof val === 'undefined' ? scrollingElement.scrollHeight : val;
  scrollingElement.scroll({
    behavior: smooth ? 'smooth' : 'auto',
    left: 0,
    top: y,
  });
};

export const remToPx = (rem: number): number => {
  const fontSize = Number(
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('font-size')
      .slice(0, -2),
  );

  return rem * fontSize;
};

const scriptsPromiseCache = new Map<string, Promise<unknown>>();

export const importIIFE = (src: string) => {
  const cachedScriptPromise = scriptsPromiseCache.get(src);

  if (cachedScriptPromise) {
    return cachedScriptPromise;
  }

  const scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });

  scriptsPromiseCache.set(src, scriptPromise);

  return scriptPromise;
};

export interface Icon {
  readonly svg?: string;
  readonly jpg?: string;
  readonly png?: string;
  readonly webp?: string;
  readonly placeholder: string;
}

export const generatePicture = (
  name: string,
  { svg, webp, jpg, placeholder }: Icon,
  size?: number,
) => `
  <picture>
    ${svg ? `<source srcset="${svg}" type="image/svg+xml">` : ''}
    ${webp ? `<source srcset="${webp}" type="image/webp">` : ''}
    ${jpg ? `<source srcset="${jpg}" type="image/jpeg">` : ''}
    <img style="background-image: url(&quot;${placeholder}&quot;);" src="${
  jpg || webp || svg
}" alt="${name}" title="${name}" loading="lazy" lazyload${
  size ? ` width="${size}" height="${size}"` : ''
}>
  </picture>
`;

export interface RegisterServiceWorkerOptions {
  onUpdate?(): unknown;
}

export const registerServiceWorker = async ({
  onUpdate,
}: RegisterServiceWorkerOptions = {}) => {
  if (process.env.ENABLE_DEV_SW && 'serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    if (registration.waiting) {
      onUpdate?.();
    }

    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;

      installingWorker.addEventListener('statechange', () => {
        if (navigator.serviceWorker.controller) {
          onUpdate?.();
        }
      });
    });
  }
};

export const loadFile = async (url: string) => {
  const res = await fetch(url);
  return res.text();
};

export const loadTemplate = async (name: string) => {
  const outputElement = document.querySelector<HTMLDivElement>(`#${name}`);

  // If there is no loading in the output element, it means that
  // the data has already been loaded, so we just do nothing
  if (
    !outputElement.firstElementChild.className.includes('loading-container')
  ) {
    return;
  }

  const template = await loadFile(`en/fragments/${name}.html`);

  outputElement.innerHTML = template;
};

export const loadStyles = (url: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`link[href="${url}"]`)) {
      return resolve();
    }

    const link = document.createElement('link');

    link.rel = 'preload';
    link.as = 'style';
    link.href = url;

    link.addEventListener(
      'load',
      () => {
        // The styles have been preloaded, but after setting the rel to
        // stylesheet we wait for the other load event for fairness, even
        // if it isn't actually needed
        link.addEventListener('load', () => resolve(), {
          once: true,
        });
        link.rel = 'stylesheet';
      },
      { once: true },
    );
    link.addEventListener('error', reject, { once: true });

    document.head.appendChild(link);
  });
