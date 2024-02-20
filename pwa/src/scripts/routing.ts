import { installRouter, updateMetadata } from 'pwa-helpers';
import { logEvent, scroll } from './utils.js';
import { getBasePath } from './path.js';
import { getLocale } from './i18n.js';
import * as translations from './translations.js';

const pageToPathMap: Record<string, string> = {
  home: import.meta.env.HOME_JS_OUTPUT,
  about: import.meta.env.ABOUT_JS_OUTPUT,
  certifications: import.meta.env.CERTIFICATIONS_JS_OUTPUT,
  contacts: import.meta.env.CONTACTS_JS_OUTPUT,
  projects: import.meta.env.PROJECTS_JS_OUTPUT,
  skills: import.meta.env.SKILLS_JS_OUTPUT,
};

export const configureRouting = () => {
  interface PageModule {
    onPageLoad?: () => void;
    onPageUnload?: () => void;
  }

  type Page =
    | 'home'
    | 'about'
    | 'certifications'
    | 'contacts'
    | 'projects'
    | 'skills';

  const slugToPageLocaleMap: Record<string, { locale: string; page: Page }> =
    Object.fromEntries(
      Object.entries(translations).flatMap(([locale, translations]) =>
        Object.entries(translations)
          .filter(([key]) => key.endsWith('Slug'))
          .map(([key, val]) => [
            val,
            { locale, page: key.replace('Slug', '') as Page },
          ]),
      ),
    );

  const pages: {
    [key in Page]: {
      title?: string;
      description: string;
      ref: HTMLElement;
      configured?: boolean;
      module?: Promise<PageModule>;
    };
  } = {
    home: {
      description:
        "Hi! I'm Giorgio, a Software Engineer trying to make the web a better place since 2004.",
      ref: document.querySelector<HTMLElement>('#home'),
    },
    about: {
      title: 'About me',
      description: 'Curious about who I am? Get to know me and what I do.',
      ref: document.querySelector<HTMLDivElement>('#about'),
    },
    certifications: {
      title: 'Certifications',
      description: 'Check out my certifications and awards.',
      ref: document.querySelector<HTMLDivElement>('#certifications'),
    },
    contacts: {
      title: 'Contacts',
      description:
        'Interested in what I do and/or have some questions? Contact me!',
      ref: document.querySelector<HTMLDivElement>('#contacts'),
    },
    projects: {
      title: 'Projects',
      description: 'Check out the list of the projects I built and maintain.',
      ref: document.querySelector<HTMLDivElement>('#projects'),
    },
    skills: {
      title: 'Skills',
      description: 'Want to know what I am good at? Check it out here.',
      ref: document.querySelector<HTMLDivElement>('#skills'),
    },
  };

  const page = document.querySelector<HTMLElement>('#page');
  const pageTitle = document.querySelector<HTMLHeadingElement>('#title');
  let previousPath: Page;

  const hide = (el: HTMLElement) => {
    el.classList.add('invisible');
    el.setAttribute('aria-hidden', 'true');
  };
  const unhide = (el: HTMLElement) => {
    el.classList.remove('invisible');
    el.setAttribute('aria-hidden', 'false');
  };

  // Configure routing
  installRouter(({ pathname }) => {
    const basePath = getBasePath();
    const locale = getLocale();
    const rawPath = pathname.replace(`${basePath}/${locale}/`, '') || 'home';
    const pageLocaleConfig = slugToPageLocaleMap[rawPath];
    const path = pageLocaleConfig?.page || 'home';
    const pageLocale = pageLocaleConfig?.locale || locale;
    if (!pageLocaleConfig) {
      window.history.replaceState({}, '', `${basePath}/${locale}/`);
    }
    if (pageLocale !== locale) {
      window.history.replaceState(
        {},
        '',
        `${basePath}/${pageLocale}/${rawPath}`,
      );
    }
    if (path === previousPath) {
      return;
    }
    if (!pages[path].module) {
      pages[path].module = import(pageToPathMap[path]);
    }
    pages[path].module.then(async ({ onPageLoad }) => {
      pages[path].configured = true;
      if (onPageLoad) {
        await onPageLoad();
      }
    });
    if (previousPath && pages[previousPath].module) {
      pages[previousPath].module.then(
        ({ onPageUnload }) => onPageUnload && onPageUnload(),
      );
    }

    const localeTranslations =
      translations[pageLocale as keyof typeof translations];
    const title = localeTranslations[`${path}Title`];
    const description = localeTranslations[`${path}Description`];
    updateMetadata({
      title: title ? `${title} - Giorgio Garasto` : 'Giorgio Garasto',
      description,
    });

    logEvent('page_view', {
      // On Google Analytics, we send "Home" instead of "Giorgio Garasto"
      // as title when we are on the home page
      page_title: !title || title === 'Giorgio Garasto' ? 'Home' : title,
      page_location: location.href,
      page_path: location.pathname,
    });

    if (path === 'home') {
      unhide(pages.home.ref);
      document.body.classList.remove('blocked');
      if (previousPath && previousPath !== 'home') {
        scroll({ smooth: false });
      }

      page.addEventListener(
        'transitionend',
        () => {
          // The page changed during the transition, so we do nothing to avoid breaking things
          if (pathname !== window.location.pathname) {
            return;
          }

          Object.entries(pages).forEach(
            ([id, { ref }]) => id !== path && (ref.hidden = true),
          );
          hide(page);
        },
        { once: true },
      );
      page.classList.add('closed');
    } else {
      unhide(page);
      pageTitle.textContent = title;
      pages[path].ref.hidden = false;
      Object.entries(pages).forEach(
        ([id, { ref }]) => id !== path && id !== 'home' && (ref.hidden = true),
      );
      if (previousPath === 'home') {
        page.addEventListener(
          'transitionend',
          () => {
            // The page changed during the transition, so we do nothing to avoid breaking things
            if (pathname !== window.location.pathname) {
              return;
            }

            hide(pages.home.ref);
            document.body.classList.add('blocked');
          },
          { once: true },
        );
        page.classList.remove('closed');
      } else {
        hide(pages.home.ref);
        document.body.classList.add('blocked');
      }
    }

    previousPath = path;
  });
};
