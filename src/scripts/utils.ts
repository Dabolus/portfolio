export const supportsWebp = new Promise(resolve => {
  const img = document.createElement('img');
  img.addEventListener('load', () => {
    if (img.width > 0 && img.height > 0) {
      return resolve(true);
    }
    resolve(false);
  });
  img.addEventListener('error', () => resolve(false));
  img.src =
    'data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==';
});
