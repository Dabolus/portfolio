import { installRouter } from 'pwa-helpers/router';
import Typed from 'typed.js';

const pages: { [key: string]: string } = {
  'about-me': 'About me',
  'certifications': 'Certifications',
  'contacts': 'Contacts',
  'home': 'Home',
  'works': 'Works',
};
const dataPromise = fetch('/api').then((res) => res.json());

const smoothScroll = (val?: number) => {
  const scrollingElement = document.scrollingElement || document.documentElement;
  const y = typeof val === 'undefined' ? scrollingElement.scrollHeight : val;
  scrollingElement.scroll({
    behavior: 'smooth',
    left: 0,
    top: y,
  });
};

window.addEventListener('load', () => {
  const main: HTMLElement = document.querySelector('main');
  const pageTitle: HTMLElement = document.getElementById('page-title');
  const fragments: NodeListOf<HTMLElement> = document.querySelectorAll('#page-container > .page');
  const menuLinks: NodeListOf<HTMLElement> = document.querySelectorAll('#menu > a');
  const since2004Link: HTMLElement = document.getElementById('since-2004-link');
  const homeLinks: HTMLElement[] = [...Array.prototype.slice.call(menuLinks), since2004Link];
  const homeSections: NodeListOf<HTMLElement> = document.querySelectorAll('#i-am, #menu');
  // Set up scrolling to the right position when navigating with tabs for accessibility
  since2004Link
    .addEventListener('focus', () => smoothScroll(0));
  menuLinks.forEach((link) =>
    link.addEventListener('focus', () => smoothScroll()));
  const age = document.getElementById('age');
  const dob = new Date('1997-09-01T23:20').getTime();

  requestAnimationFrame(function updateAge() {
    requestAnimationFrame(updateAge);
    age.textContent = ((Date.now() - dob) / 31556952000).toFixed(9);
  });

  dataPromise.then((data) => {
    document.getElementById('my-summary').innerHTML = data.summary;
    document.getElementById('job-title').textContent = data.job.title;
    document.getElementById('company-name').textContent = data.job.company.name;
    document.getElementById('company-size').textContent = data.job.company.size;
  }).catch((e) => document.body.innerHTML = `<h1>Unexpected fatal error!</h1><pre>${e}</pre>`);

  new Typed('#typed', {
    backDelay: 2000,
    backSpeed: 30,
    loop: true,
    showCursor: false,
    smartBackspace: false,
    startDelay: 0,
    stringsElement: '#strings',
    typeSpeed: 90,
  });

  let oldPath: string;
  installRouter(({ pathname }) => {
    let path = pathname.substring(1);
    if (!path || !Object.keys(pages).includes(path)) {
      window.history.replaceState({}, '', '/home');
      path = 'home';
    }
    document.title = `Giorgio Garasto - ${pages[path]}`;
    if (path === 'home') {
      document.body.className = '';
      main.className = '';
      homeLinks.forEach((link) =>
        link.setAttribute('tabindex', '0'));
      homeSections.forEach((section) =>
        section.hidden = false);
      const oldElement: HTMLElement =
        document.querySelector(`#page-container > .page[data-page="${oldPath}"`);
      if (oldElement) {
        oldElement.focus();
      }
      setTimeout(() => main.hidden = true, 600);
    } else {
      smoothScroll();
      main.hidden = false;
      setTimeout(() => {
        pageTitle.textContent = pages[path];
        fragments.forEach((fragment) =>
          fragment.className = fragment.dataset.page === path ? 'page active' : 'page');
        document.body.className = 'blocked';
        main.className = 'active';
        pageTitle.focus();
      }, 50);
      setTimeout(() => {
        homeLinks.forEach((link) =>
          link.setAttribute('tabindex', '-1'));
        homeSections.forEach((section) =>
          section.hidden = true);
      }, 650);
    }
    oldPath = path;
  });
});
