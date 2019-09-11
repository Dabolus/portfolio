import { startAnimation, stopAnimation } from '../animation';

// Configure age animation
const age = document.getElementById('age');
const dob = 873148830000; // 1st Sep 1997 at 23:20:30

const updateAge = () => {
  stopAnimation('age');
  // TODO: decide whether to use actual years or Gregorian calendar years (in that case we would have 365.2425 days per year)
  // Interesting links and papers:
  // - https://pumas.jpl.nasa.gov/files/04_21_97_1.pdf
  // - https://www.grc.nasa.gov/WWW/k-12/Numbers/Math/Mathematical_Thinking/calendar_calculations.htm
  age.textContent = ((Date.now() - dob) / 31556926000) // 1 year (365 days, 5 hours, 48 minutes and 46 seconds)
    .toFixed(9);
  startAnimation('age', updateAge);
};

export const onPageLoad = () => {
  startAnimation('age', updateAge);
};

export const onPageUnload = () => {
  stopAnimation('age');
};
