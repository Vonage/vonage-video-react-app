import { LAYOUT_MODES, type LayoutMode } from './types/session';

declare const __APP_ENV__: Record<string, string | undefined>;

export type Lang = 'en' | 'it' | 'es' | 'es-MX' | 'en-US' | 'de';

export const RESOLUTIONS = [
  '1920x1080',
  '1280x960',
  '1280x720',
  '640x480',
  '640x360',
  '320x240',
  '320x180',
] as const;

export type Resolution = (typeof RESOLUTIONS)[number];

export type Mode = 'development' | 'production' | 'test';

export type EnvArg = {
  [key: string]: unknown;
};

function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  if (typeof value === 'object' || typeof value === 'function') return JSON.stringify(value);
  return String(value as string | number | bigint | boolean);
}

function parseBoolean(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined || value === null || value === '') return defaultValue;

  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  throw new Error(`Invalid boolean env value: ${toDisplayString(value)}`);
}

function parseString(value: unknown, name: string, defaultValue?: string): string {
  if (value === undefined || value === null || value === '') {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Env ${name} is required`);
  }

  if (typeof value !== 'string') {
    throw new Error(`Env ${name} must be a string`);
  }

  return value;
}

function parseOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string')
    throw new Error(`Invalid string env value: ${toDisplayString(value)}`);
  return value;
}

const LANGS: Lang[] = ['en', 'it', 'es', 'es-MX', 'en-US', 'de'];

function parseLang(value: unknown, fallback: Lang): Lang {
  if (value === undefined || value === null || value === '') return fallback;

  if (typeof value !== 'string') {
    throw new Error(`Invalid language type: ${toDisplayString(value)}`);
  }

  if (!LANGS.includes(value as Lang)) {
    throw new Error(`Invalid language: ${toDisplayString(value)}`);
  }

  return value as Lang;
}

function parseLangList(value: unknown, fallback: Lang): Lang[] {
  if (!value) return [fallback];

  if (typeof value !== 'string') {
    throw new Error(`Invalid I18N_SUPPORTED_LANGUAGES`);
  }

  return value.split('|').map((l) => {
    const lang = l.trim();
    if (!LANGS.includes(lang as Lang)) {
      throw new Error(`Invalid supported language: ${lang}`);
    }
    return lang as Lang;
  });
}

function parseResolution(value: unknown, fallback: Resolution | undefined): Resolution | undefined {
  if (value === undefined || value === null || value === '') return fallback;

  if (typeof value !== 'string') {
    throw new Error(`Invalid resolution type: ${toDisplayString(value)}`);
  }

  if (!RESOLUTIONS.includes(value as Resolution)) {
    throw new Error(`Invalid DEFAULT_RESOLUTION: ${toDisplayString(value)}`);
  }

  return value as Resolution;
}

function parseLayoutMode(value: unknown, fallback: LayoutMode): LayoutMode {
  if (value === undefined || value === null || value === '') return fallback;

  if (typeof value !== 'string') {
    throw new Error(`Invalid layout mode type: ${toDisplayString(value)}`);
  }

  if (!(LAYOUT_MODES as readonly string[]).includes(value)) {
    throw new Error(
      `Invalid DEFAULT_LAYOUT_MODE: "${value}". Allowed values: ${LAYOUT_MODES.join(', ')}`
    );
  }

  return value as LayoutMode;
}

function parseMode(value: unknown): Mode {
  if (value === 'development' || value === 'production' || value === 'test') {
    return value;
  }
  throw new Error(`Invalid MODE: ${toDisplayString(value)}`);
}

export class Env {
  private raw: Partial<EnvArg>;
  private initialRaw: Partial<EnvArg>;

  public ENABLE_REPORT_ISSUE: boolean;
  public I18N_FALLBACK_LANGUAGE: Lang;
  public I18N_SUPPORTED_LANGUAGES: Lang[];

  public ALLOW_BACKGROUND_EFFECTS: boolean;
  public ALLOW_CAMERA_CONTROL: boolean;
  public ALLOW_VIDEO_ON_JOIN: boolean;
  public DEFAULT_RESOLUTION: Resolution | undefined;
  public ALLOW_ADVANCED_NOISE_SUPPRESSION: boolean;
  public ALLOW_AUDIO_ON_JOIN: boolean;
  public ALLOW_MICROPHONE_CONTROL: boolean;
  public WAITING_ROOM_ALLOW_DEVICE_SELECTION: boolean;
  public ALLOW_ARCHIVING: boolean;
  public ALLOW_CAPTIONS: boolean;
  public ALLOW_CHAT: boolean;
  public MEETING_ROOM_ALLOW_DEVICE_SELECTION: boolean;
  public ALLOW_EMOJIS: boolean;
  public ALLOW_SCREEN_SHARE: boolean;
  public DEFAULT_LAYOUT_MODE: LayoutMode;
  public SHOW_PARTICIPANT_LIST: boolean;
  public BYPASS_WAITING_ROOM: boolean;
  public API_URL: string;
  public TUNNEL_DOMAIN: string | undefined;
  public AVOID_FETCHING_APP_CONFIG: boolean;
  public MODE: Mode;

  constructor(env: Record<string, unknown>) {
    this.raw = { ...env };
    this.initialRaw = { ...env };

    this.I18N_FALLBACK_LANGUAGE = parseLang(env.I18N_FALLBACK_LANGUAGE, 'en');

    this.I18N_SUPPORTED_LANGUAGES = parseLangList(
      env.I18N_SUPPORTED_LANGUAGES,
      this.I18N_FALLBACK_LANGUAGE
    );

    this.ENABLE_REPORT_ISSUE = parseBoolean(env.ENABLE_REPORT_ISSUE, false);
    this.ALLOW_BACKGROUND_EFFECTS = parseBoolean(env.ALLOW_BACKGROUND_EFFECTS, true);
    this.ALLOW_CAMERA_CONTROL = parseBoolean(env.ALLOW_CAMERA_CONTROL, true);
    this.ALLOW_VIDEO_ON_JOIN = parseBoolean(env.ALLOW_VIDEO_ON_JOIN, true);
    this.ALLOW_ADVANCED_NOISE_SUPPRESSION = parseBoolean(
      env.ALLOW_ADVANCED_NOISE_SUPPRESSION,
      true
    );
    this.ALLOW_AUDIO_ON_JOIN = parseBoolean(env.ALLOW_AUDIO_ON_JOIN, true);
    this.ALLOW_MICROPHONE_CONTROL = parseBoolean(env.ALLOW_MICROPHONE_CONTROL, true);
    this.WAITING_ROOM_ALLOW_DEVICE_SELECTION = parseBoolean(
      env.WAITING_ROOM_ALLOW_DEVICE_SELECTION,
      true
    );
    this.ALLOW_ARCHIVING = parseBoolean(env.ALLOW_ARCHIVING, true);
    this.ALLOW_CAPTIONS = parseBoolean(env.ALLOW_CAPTIONS, true);
    this.ALLOW_CHAT = parseBoolean(env.ALLOW_CHAT, true);
    this.MEETING_ROOM_ALLOW_DEVICE_SELECTION = parseBoolean(
      env.MEETING_ROOM_ALLOW_DEVICE_SELECTION,
      true
    );
    this.ALLOW_EMOJIS = parseBoolean(env.ALLOW_EMOJIS, true);
    this.ALLOW_SCREEN_SHARE = parseBoolean(env.ALLOW_SCREEN_SHARE, true);
    this.SHOW_PARTICIPANT_LIST = parseBoolean(env.SHOW_PARTICIPANT_LIST, true);
    this.BYPASS_WAITING_ROOM = parseBoolean(env.BYPASS_WAITING_ROOM, false);
    this.AVOID_FETCHING_APP_CONFIG = parseBoolean(env.AVOID_FETCHING_APP_CONFIG, true);

    this.DEFAULT_RESOLUTION = parseResolution(env.DEFAULT_RESOLUTION, '1280x720');

    this.DEFAULT_LAYOUT_MODE = parseLayoutMode(env.DEFAULT_LAYOUT_MODE, 'active-speaker');

    this.API_URL = parseString(env.API_URL, 'API_URL', '');
    this.setApiUrl(this.API_URL);

    this.TUNNEL_DOMAIN = parseOptionalString(env.TUNNEL_DOMAIN);

    this.MODE = parseMode(env.MODE ?? 'development');
  }

  /**
   * Partially updates the environment variables at runtime.
   * Useful for testing different configurations without reloading the page.
   * @param {Partial<EnvArg>} partial - An object containing the env variables to update.
   */
  partialUpdate(partial: Partial<EnvArg>) {
    this.raw = {
      ...this.raw,
      ...partial,
    };
    const next = new Env(this.raw);
    const savedInitialRaw = this.initialRaw;
    Object.assign(this, next);
    this.initialRaw = savedInitialRaw;
  }

  /**
   * Resets all environment variables to their initial values when the Env instance was created.
   * Useful for cleaning up after tests that call partialUpdate.
   */
  reset() {
    const next = new Env(this.initialRaw);
    this.raw = { ...this.initialRaw };
    Object.assign(this, next);
  }

  /**
   * Sets API_URL based on the provided envUrl or defaults to window.location.origin.
   * If envUrl is empty or undefined, it defaults to window.location.origin.
   * If window.location.origin includes 'localhost', it defaults to 'http://localhost:3345' to account for typical local API setups.
   * @param envUrl - The raw environment variable value for API_URL, which can be empty or undefined.
   */
  setApiUrl(envUrl: string | undefined) {
    const url = (() => {
      if (!envUrl?.trim()) {
        return window.location.origin.includes('localhost')
          ? 'http://localhost:3345'
          : window.location.origin;
      }

      return envUrl;
    })();

    this.API_URL = url;
  }

  /**
   * Parses a '|'-separated string of language codes and updates I18N_SUPPORTED_LANGUAGES.
   * Throws if any language code is not in the supported list.
   * Falls back to I18N_FALLBACK_LANGUAGE when the value is empty or undefined.
   * @param {unknown} value - Raw language string, e.g. "en|es|it".
   */
  setSupportedLanguages(value: unknown) {
    this.I18N_SUPPORTED_LANGUAGES = parseLangList(value, this.I18N_FALLBACK_LANGUAGE);
  }
}

let env: Env;
let envInitError: Error | null = null;

try {
  env = new Env(__APP_ENV__);
} catch (error) {
  envInitError = error instanceof Error ? error : new Error(String(error));
  // Provide a safe shell so that callers that import `env` at module level
  // don't throw a second time on property access before EnvGuard re-throws.
  env = {} as Env;
}

export { env, envInitError };
