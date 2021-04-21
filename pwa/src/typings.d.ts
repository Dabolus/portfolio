declare module 'typed.js/src/typed' {
  import Typed from 'typed.js';
  export default Typed;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly [key: string]: any;
    readonly NODE_ENV: 'production' | 'development';
    readonly ENABLE_SERVICE_WORKER?: boolean;
    readonly API_URL: string;
    readonly HOME_JS_OUTPUT: string;
    readonly ABOUT_JS_OUTPUT: string;
    readonly CERTIFICATIONS_JS_OUTPUT: string;
    readonly CONTACTS_JS_OUTPUT: string;
    readonly PROJECTS_JS_OUTPUT: string;
    readonly SKILLS_JS_OUTPUT: string;
    readonly HOME_CSS_OUTPUT: string;
    readonly ABOUT_CSS_OUTPUT: string;
    readonly CERTIFICATIONS_CSS_OUTPUT: string;
    readonly CONTACTS_CSS_OUTPUT: string;
    readonly PROJECTS_CSS_OUTPUT: string;
    readonly SKILLS_CSS_OUTPUT: string;
  }
}
