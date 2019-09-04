export const supportsWebp = new Promise(resolve => {
  const img = document.createElement('img');
  img.addEventListener(
    'load',
    () => {
      if (img.width > 0 && img.height > 0) {
        return resolve(true);
      }
      resolve(false);
    },
    { once: true },
  );
  img.addEventListener('error', () => resolve(false), { once: true });
  img.src =
    'data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==';
});

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
