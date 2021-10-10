import { remToPx } from './utils.js';

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

export const setupTopBarAnimation = () => {
  const header = document.querySelector<HTMLDivElement>('#header');
  const scrollTarget =
    document.querySelector<HTMLDivElement>('#content-container');

  let ticking = false;
  let latestPosition = scrollTarget.scrollTop;
  let scrollFromTop = 0;
  let headerHeight = remToPx(3.55);

  window.addEventListener('resize', () => (headerHeight = remToPx(3.55)), {
    passive: true,
  });

  scrollTarget.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { scrollTop } = scrollTarget;

          const realScroll = Math.max(0, scrollTop);

          if (latestPosition < realScroll && scrollFromTop >= -headerHeight) {
            scrollFromTop = Math.max(
              -headerHeight,
              scrollFromTop + (latestPosition - realScroll),
            );
          } else if (scrollFromTop <= 0) {
            scrollFromTop = Math.min(
              0,
              scrollFromTop - (realScroll - latestPosition),
            );
          }

          header.style.transform = `translateY(${scrollFromTop}px)`;
          latestPosition = realScroll;

          ticking = false;
        });

        ticking = true;
      }
    },
    {
      passive: true,
    },
  );
};
