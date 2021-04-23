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

let _newSw: ServiceWorker;

export const setupServiceWorker = async () => {
  const updateNotification = document.querySelector<HTMLDivElement>(
    '#update-notification',
  );
  const cancelUpdateButton = document.querySelector<HTMLButtonElement>(
    '#cancel-update',
  );
  const performUpdateButton = document.querySelector<HTMLButtonElement>(
    '#perform-update',
  );

  const showUpdateNotification = async () => {
    updateNotification.hidden = false;
    await sleep(50);
    updateNotification.className = 'shown';
  };

  const hideUpdateNotification = async () => {
    updateNotification.className = '';
    await sleep(300);
    updateNotification.hidden = true;
  };

  cancelUpdateButton.addEventListener('click', () => hideUpdateNotification(), {
    once: true,
  });

  performUpdateButton.addEventListener(
    'click',
    () => _newSw.postMessage({ action: 'update' }),
    { once: true },
  );

  if (process.env.ENABLE_SERVICE_WORKER && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js', {
        scope: '/',
      })
      .catch(console.warn);
  }

  const trackInstallation = (sw: ServiceWorker) => {
    sw.addEventListener('statechange', async () => {
      if (sw.state === 'installed') {
        _newSw = sw;

        showUpdateNotification();
      }
    });
  };

  await navigator.serviceWorker
    .register('/sw.js', {
      scope: '/',
    })
    .catch(console.warn);

  if (!navigator.serviceWorker.controller) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration('/');

  if (!registration) {
    return;
  }

  if (registration.waiting) {
    _newSw = registration.waiting;
    showUpdateNotification();
    return;
  }

  if (registration.installing) {
    trackInstallation(registration.installing);
    return;
  }

  registration.addEventListener('updatefound', () =>
    trackInstallation(registration.installing!),
  );

  navigator.serviceWorker.addEventListener('controllerchange', () =>
    window.location.reload(),
  );
};

export const loadFile = async (url: string) => {
  const res = await fetch(url);
  return res.text();
};

export const loadTemplate = async (name: string) => {
  const template = await loadFile(`en/fragments/${name}.html`);
  const outputElement = document.querySelector<HTMLDivElement>(`#${name}`);

  return () => {
    // If there is no loading in the output element, it means that
    // the data has already been loaded, so we just do nothing
    if (
      !outputElement.firstElementChild.className.includes('loading-container')
    ) {
      return;
    }

    outputElement.innerHTML = template;
  };
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

const initializeAnalytics = async () => {
  const [{ initializeApp }, { getAnalytics }] = await Promise.all([
    import('firebase/app'),
    import('firebase/analytics'),
  ]);

  const app = initializeApp({
    apiKey: 'AIzaSyAr4j37kpaRwCtfFOI317G24vl-Zd6Ar9Y',
    projectId: 'giorgio-garasto-pwa',
    appId: '1:366299128980:web:3086f9de9d8e90962ec081',
    measurementId: 'G-2BXKCDTVNJ',
  });
  const analytics = getAnalytics(app);

  return analytics;
};

const analyticsPromise = initializeAnalytics();

type FirebaseLogEventParameters = Parameters<
  typeof import('firebase/analytics')['logEvent']
>;

export const logEvent = async (
  eventName: FirebaseLogEventParameters[1],
  eventParams?: FirebaseLogEventParameters[2],
  options?: FirebaseLogEventParameters[3],
) => {
  const [analytics, { logEvent: firebaseLogEvent }] = await Promise.all([
    analyticsPromise,
    import('firebase/analytics'),
  ]);

  if (process.env.NODE_ENV !== 'production') {
    console.groupCollapsed('Analytics event');
    console.info(`Name: ${eventName}`);

    const { offline, ...filteredParams } = eventParams as Record<
      string,
      unknown
    >;

    if (Object.keys(filteredParams).length > 0) {
      console.info('Params:');
      console.table(filteredParams);
    }

    console.groupEnd();

    return;
  }

  return firebaseLogEvent(
    analytics,
    eventName,
    {
      ...eventParams,
      offline: false,
    },
    options,
  );
};
