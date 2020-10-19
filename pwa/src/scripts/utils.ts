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
