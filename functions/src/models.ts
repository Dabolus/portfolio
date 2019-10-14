export interface RuntimeConfig {
  readonly github: {
    readonly token: string;
  };
  readonly recaptcha: {
    readonly secret: string;
  };
  readonly mail: {
    readonly to: string;
    readonly host: string;
    readonly port: number;
    readonly secure: boolean;
    readonly auth: {
      readonly user: string;
      readonly id: string;
      readonly secret: string;
    };
  };
}
