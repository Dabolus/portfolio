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
