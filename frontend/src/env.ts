export type Lang = 'en' | 'it' | 'es' | 'es-MX' | 'en-US';

export type EnvArg = {
  VITE_ENABLE_REPORT_ISSUE: boolean | string;
  VITE_I18N_FALLBACK_LANGUAGE: Lang;
  VITE_I18N_SUPPORTED_LANGUAGES: string;
  VITE_BYPASS_WAITING_ROOM: boolean | string;
  VITE_API_URL: string;
  VITE_TUNNEL_DOMAIN: string;
  VITE_AVOID_FETCHING_APP_CONFIG: string;
  MODE: 'development' | 'production' | 'test';
};

export class Env {
  public VITE_ENABLE_REPORT_ISSUE: boolean;

  public VITE_I18N_FALLBACK_LANGUAGE: Lang;

  public VITE_I18N_SUPPORTED_LANGUAGES: Lang[] = [];

  public VITE_BYPASS_WAITING_ROOM: boolean;

  public VITE_API_URL: string = '';

  public VITE_TUNNEL_DOMAIN: string | undefined;

  public VITE_AVOID_FETCHING_APP_CONFIG: boolean = true;

  public MODE: 'development' | 'production' | 'test';

  constructor(env: Partial<EnvArg>) {
    this.VITE_ENABLE_REPORT_ISSUE = toBoolean(env.VITE_ENABLE_REPORT_ISSUE);
    this.VITE_I18N_FALLBACK_LANGUAGE = env.VITE_I18N_FALLBACK_LANGUAGE || 'en';

    this.setSupportedLanguages(env.VITE_I18N_SUPPORTED_LANGUAGES);

    this.VITE_BYPASS_WAITING_ROOM = toBoolean(env.VITE_BYPASS_WAITING_ROOM);

    this.setViteApiUrl(env.VITE_API_URL);

    this.VITE_TUNNEL_DOMAIN = env.VITE_TUNNEL_DOMAIN;
    this.VITE_AVOID_FETCHING_APP_CONFIG = toBoolean(env.VITE_AVOID_FETCHING_APP_CONFIG);
    this.MODE = env.MODE || 'development';
  }

  setViteApiUrl = (envUrl: string | undefined) => {
    const url = (() => {
      if (!envUrl?.trim()) {
        return window.location.origin.includes('localhost')
          ? 'http://localhost:3345'
          : window.location.origin;
      }

      return envUrl;
    })();

    this.VITE_API_URL = url;
  };

  /**
   * Parses a string of languages separated by '|' into an array of Lang.
   * If the input is undefined or empty, returns an array with the fallback language.
   * @param {string | undefined} VITE_I18N_SUPPORTED_LANGUAGES - The supported languages string separated by '|'.
   */
  setSupportedLanguages = (VITE_I18N_SUPPORTED_LANGUAGES: string | undefined) => {
    const languages = (() => {
      const fallbackLangs = [this.VITE_I18N_FALLBACK_LANGUAGE];

      if (!VITE_I18N_SUPPORTED_LANGUAGES) {
        return fallbackLangs;
      }

      const langs = String(VITE_I18N_SUPPORTED_LANGUAGES)
        .split('|')
        .map((lang) => lang.trim()) as Lang[];

      return langs.length > 0 ? langs : fallbackLangs;
    })();

    this.VITE_I18N_SUPPORTED_LANGUAGES = languages;
  };
}

function toBoolean(value: string | boolean | undefined): boolean {
  return value === true || value === 'true';
}

export default new Env(import.meta.env as unknown as EnvArg);
