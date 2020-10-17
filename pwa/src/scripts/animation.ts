const frameMap: { [key: string]: number } = {};

export const startAnimation = (id: string, callback: () => void) => {
  if (!frameMap[id]) {
    frameMap[id] = requestAnimationFrame(callback);
  }
};

export const stopAnimation = (id: string) => {
  if (frameMap[id]) {
    cancelAnimationFrame(frameMap[id]);
    delete frameMap[id];
  }
};
