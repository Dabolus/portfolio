declare module 'typed.js/src/typed' {
  import Typed from 'typed.js';
  export default Typed;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly [key: string]: any;
    readonly ENABLE_DEV_SW?: boolean;
    readonly API_URL: string;
    readonly HOME_OUTPUT: string;
    readonly ABOUT_OUTPUT: string;
    readonly CERTIFICATIONS_OUTPUT: string;
    readonly CONTACTS_OUTPUT: string;
    readonly PROJECTS_OUTPUT: string;
    readonly SKILLS_OUTPUT: string;
  }
}
