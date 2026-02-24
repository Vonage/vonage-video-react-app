export type Lang = 'en' | 'it' | 'es' | 'es-MX' | 'en-US';

export type EnvArg = {
  VITE_ENABLE_REPORT_ISSUE: boolean | string;
  VITE_I18N_FALLBACK_LANGUAGE: Lang;
  VITE_I18N_SUPPORTED_LANGUAGES: string;
  VITE_ALLOW_BACKGROUND_EFFECTS: boolean | string;
  VITE_ALLOW_CAMERA_CONTROL: boolean | string;
  VITE_ALLOW_VIDEO_ON_JOIN: boolean | string;
  VITE_DEFAULT_RESOLUTION:
    | '1920x1080'
    | '1280x960'
    | '1280x720'
    | '640x480'
    | '640x360'
    | '320x240'
    | '320x180'
    | undefined;
  VITE_ALLOW_ADVANCED_NOISE_SUPPRESSION: boolean | string;
  VITE_ALLOW_AUDIO_ON_JOIN: boolean | string;
  VITE_ALLOW_MICROPHONE_CONTROL: boolean | string;
  VITE_WAITING_ROOM_ALLOW_DEVICE_SELECTION: boolean | string;
  VITE_ALLOW_ARCHIVING: boolean | string;
  VITE_ALLOW_CAPTIONS: boolean | string;
  VITE_ALLOW_CHAT: boolean | string;
  VITE_MEETING_ROOM_ALLOW_DEVICE_SELECTION: boolean | string;
  VITE_ALLOW_EMOJIS: boolean | string;
  VITE_ALLOW_SCREEN_SHARE: boolean | string;
  VITE_DEFAULT_LAYOUT_MODE: string;
  VITE_SHOW_PARTICIPANT_LIST: boolean | string;
  VITE_BYPASS_WAITING_ROOM: boolean | string;
  VITE_API_URL: string;
  VITE_TUNNEL_DOMAIN: string;
  VITE_AVOID_FETCHING_APP_CONFIG: string;
  MODE: 'development' | 'production' | 'test';
};

export class Env {
  private raw: Partial<EnvArg>;

  private initialRaw: Partial<EnvArg>;

  public VITE_ENABLE_REPORT_ISSUE: boolean;

  public VITE_I18N_FALLBACK_LANGUAGE: Lang;

  public VITE_I18N_SUPPORTED_LANGUAGES: Lang[] = [];

  public VITE_ALLOW_BACKGROUND_EFFECTS: boolean = true;

  public VITE_ALLOW_CAMERA_CONTROL: boolean = true;

  public VITE_ALLOW_VIDEO_ON_JOIN: boolean = true;

  public VITE_DEFAULT_RESOLUTION:
    | '1920x1080'
    | '1280x960'
    | '1280x720'
    | '640x480'
    | '640x360'
    | '320x240'
    | '320x180'
    | undefined = '1280x720';

  public VITE_ALLOW_ADVANCED_NOISE_SUPPRESSION: boolean = true;

  public VITE_ALLOW_AUDIO_ON_JOIN: boolean = true;

  public VITE_ALLOW_MICROPHONE_CONTROL: boolean = true;

  public VITE_WAITING_ROOM_ALLOW_DEVICE_SELECTION: boolean = true;

  public VITE_ALLOW_ARCHIVING: boolean = true;

  public VITE_ALLOW_CAPTIONS: boolean = true;

  public VITE_ALLOW_CHAT: boolean = true;

  public VITE_MEETING_ROOM_ALLOW_DEVICE_SELECTION: boolean = true;

  public VITE_ALLOW_EMOJIS: boolean = true;

  public VITE_ALLOW_SCREEN_SHARE: boolean = true;

  public VITE_DEFAULT_LAYOUT_MODE: string = 'active-speaker';

  public VITE_SHOW_PARTICIPANT_LIST: boolean = true;

  public VITE_BYPASS_WAITING_ROOM: boolean;

  public VITE_API_URL: string = '';

  public VITE_TUNNEL_DOMAIN: string | undefined;

  public VITE_AVOID_FETCHING_APP_CONFIG: boolean = true;

  public MODE: 'development' | 'production' | 'test';

  constructor(env: Partial<EnvArg>) {
    this.raw = { ...env };
    this.initialRaw = { ...env };

    this.VITE_ENABLE_REPORT_ISSUE = toBoolean(env.VITE_ENABLE_REPORT_ISSUE);
    this.VITE_I18N_FALLBACK_LANGUAGE = env.VITE_I18N_FALLBACK_LANGUAGE || 'en';

    this.setSupportedLanguages(env.VITE_I18N_SUPPORTED_LANGUAGES);

    this.VITE_ALLOW_BACKGROUND_EFFECTS = toBoolean(env.VITE_ALLOW_BACKGROUND_EFFECTS);
    this.VITE_ALLOW_CAMERA_CONTROL = toBoolean(env.VITE_ALLOW_CAMERA_CONTROL);
    this.VITE_ALLOW_VIDEO_ON_JOIN = toBoolean(env.VITE_ALLOW_VIDEO_ON_JOIN);
    this.VITE_DEFAULT_RESOLUTION = env.VITE_DEFAULT_RESOLUTION || this.VITE_DEFAULT_RESOLUTION;
    this.VITE_ALLOW_ADVANCED_NOISE_SUPPRESSION = toBoolean(
      env.VITE_ALLOW_ADVANCED_NOISE_SUPPRESSION
    );
    this.VITE_ALLOW_AUDIO_ON_JOIN = toBoolean(env.VITE_ALLOW_AUDIO_ON_JOIN);
    this.VITE_ALLOW_MICROPHONE_CONTROL = toBoolean(env.VITE_ALLOW_MICROPHONE_CONTROL);
    this.VITE_WAITING_ROOM_ALLOW_DEVICE_SELECTION = toBoolean(
      env.VITE_WAITING_ROOM_ALLOW_DEVICE_SELECTION
    );
    this.VITE_ALLOW_ARCHIVING = toBoolean(env.VITE_ALLOW_ARCHIVING);
    this.VITE_ALLOW_CAPTIONS = toBoolean(env.VITE_ALLOW_CAPTIONS);
    this.VITE_ALLOW_CHAT = toBoolean(env.VITE_ALLOW_CHAT);
    this.VITE_MEETING_ROOM_ALLOW_DEVICE_SELECTION = toBoolean(
      env.VITE_MEETING_ROOM_ALLOW_DEVICE_SELECTION
    );
    this.VITE_ALLOW_EMOJIS = toBoolean(env.VITE_ALLOW_EMOJIS);
    this.VITE_ALLOW_SCREEN_SHARE = toBoolean(env.VITE_ALLOW_SCREEN_SHARE);
    this.VITE_DEFAULT_LAYOUT_MODE = env.VITE_DEFAULT_LAYOUT_MODE || this.VITE_DEFAULT_LAYOUT_MODE;
    this.VITE_SHOW_PARTICIPANT_LIST = toBoolean(env.VITE_SHOW_PARTICIPANT_LIST);

    this.VITE_BYPASS_WAITING_ROOM = toBoolean(env.VITE_BYPASS_WAITING_ROOM);

    this.setViteApiUrl(env.VITE_API_URL);

    this.VITE_TUNNEL_DOMAIN = env.VITE_TUNNEL_DOMAIN;
    this.VITE_AVOID_FETCHING_APP_CONFIG = toBoolean(env.VITE_AVOID_FETCHING_APP_CONFIG);
    this.MODE = env.MODE || 'development';
  }

  partialUpdate(partial: Partial<EnvArg>) {
    this.raw = {
      ...this.raw,
      ...partial,
    };
    const next = new Env(this.raw);
    Object.assign(this, next);
  }

  reset() {
    const next = new Env(this.initialRaw);
    this.raw = { ...this.initialRaw };
    Object.assign(this, next);
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
