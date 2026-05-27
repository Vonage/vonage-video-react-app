import { z } from 'zod';
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

const langValues = ['en', 'it', 'es', 'es-MX', 'en-US', 'de'] as const satisfies readonly Lang[];
const langEnum = z.enum([...langValues] as [Lang, ...Lang[]]);

const boolField = (defaultValue: boolean) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return defaultValue;
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean());

const positiveIntField = (defaultValue: number) =>
  z.preprocess(
    (val) => (val === undefined || val === null || val === '' ? defaultValue : Number(val)),
    z.number().int().positive()
  );

const intListField = (fallback: number[]) =>
  z.preprocess((val) => {
    if (!val) return fallback;
    if (typeof val !== 'string') throw new Error('Expected pipe-separated integer list');
    return val.split('|').map((v) => {
      const n = Number(v.trim());
      if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid integer value in list: ${v}`);
      return n;
    });
  }, z.array(z.number().int().positive()));

const optionalStringField = z.preprocess(
  (val) => (val === undefined || val === null || val === '' ? undefined : val),
  z.string().optional()
);

const langListField = (fallback: Lang) =>
  z.preprocess((val) => {
    if (!val) return [fallback];
    if (typeof val !== 'string') throw new Error('Invalid I18N_SUPPORTED_LANGUAGES');
    return val.split('|').map((l) => {
      const lang = l.trim();
      if (!langValues.includes(lang as Lang))
        throw new Error(`Invalid supported language: ${lang}`);
      return lang;
    });
  }, z.array(langEnum));

const envSchema = z
  .object({
    I18N_FALLBACK_LANGUAGE: z.preprocess(
      (v) => (v === undefined || v === null || v === '' ? 'en' : v),
      langEnum
    ),
    I18N_SUPPORTED_LANGUAGES: z.union([z.string(), z.null(), z.undefined()]).optional(),
    ENABLE_REPORT_ISSUE: boolField(false),
    ALLOW_BACKGROUND_EFFECTS: boolField(true),
    ALLOW_CAMERA_CONTROL: boolField(true),
    ALLOW_VIDEO_ON_JOIN: boolField(true),
    DEFAULT_RESOLUTION: z.preprocess(
      (v) => (v === undefined || v === null || v === '' ? undefined : v),
      z.enum([...RESOLUTIONS] as [Resolution, ...Resolution[]]).optional()
    ),
    PUBLISHER_MAX_RESOLUTION: z.preprocess(
      (v) => (v === undefined || v === null || v === '' ? '1920x1080' : v),
      z.enum([...RESOLUTIONS] as [Resolution, ...Resolution[]])
    ),
    NOTIFICATION_DURATION_MS: positiveIntField(4_000),
    MIN_CUSTOM_VIDEO_BITRATE_BPS: positiveIntField(5_000),
    MAX_CUSTOM_VIDEO_BITRATE_BPS: positiveIntField(10_000_000),
    SUPPORTED_FRAME_RATES: intListField([30, 15, 7, 1]),
    ALLOW_ADVANCED_NOISE_SUPPRESSION: boolField(true),
    ALLOW_AUDIO_ON_JOIN: boolField(true),
    ALLOW_MICROPHONE_CONTROL: boolField(true),
    MEETING_ROOM_ALLOW_ADVANCED_SETTINGS: boolField(false),
    WAITING_ROOM_ALLOW_ADVANCED_SETTINGS: boolField(false),
    WAITING_ROOM_ALLOW_DEVICE_SELECTION: boolField(true),
    ALLOW_ARCHIVING: boolField(true),
    ALLOW_CAPTIONS: boolField(true),
    ALLOW_CHAT: boolField(true),
    MEETING_ROOM_ALLOW_DEVICE_SELECTION: boolField(true),
    ALLOW_EMOJIS: boolField(true),
    ALLOW_SCREEN_SHARE: boolField(true),
    DEFAULT_LAYOUT_MODE: z.preprocess(
      (v) => (v === undefined || v === null || v === '' ? 'active-speaker' : v),
      z.enum([...LAYOUT_MODES] as [LayoutMode, ...LayoutMode[]])
    ),
    SHOW_PARTICIPANT_LIST: boolField(true),
    SHOW_VIDEO_STATS: boolField(false),
    BYPASS_WAITING_ROOM: boolField(false),
    API_URL: z.preprocess((v) => (v === undefined || v === null || v === '' ? '' : v), z.string()),
    TUNNEL_DOMAIN: optionalStringField,
    AVOID_FETCHING_APP_CONFIG: boolField(true),
    MODE: z.preprocess(
      (v) => v ?? 'development',
      z.enum(['development', 'production', 'test'] as const)
    ),
    VONAGE_VIDEO_HOST: optionalStringField,
  })
  .transform(({ I18N_FALLBACK_LANGUAGE, I18N_SUPPORTED_LANGUAGES, ...rest }) => ({
    ...rest,
    I18N_FALLBACK_LANGUAGE,
    I18N_SUPPORTED_LANGUAGES: langListField(I18N_FALLBACK_LANGUAGE).parse(I18N_SUPPORTED_LANGUAGES),
  }));

export class Env {
  private raw: Partial<EnvArg>;
  private initialRaw: Partial<EnvArg>;

  public ENABLE_REPORT_ISSUE!: boolean;
  public I18N_FALLBACK_LANGUAGE!: Lang;
  public I18N_SUPPORTED_LANGUAGES!: Lang[];

  public ALLOW_BACKGROUND_EFFECTS!: boolean;
  public ALLOW_CAMERA_CONTROL!: boolean;
  public ALLOW_VIDEO_ON_JOIN!: boolean;
  public DEFAULT_RESOLUTION!: Resolution | undefined;
  public PUBLISHER_MAX_RESOLUTION!: Resolution;
  public NOTIFICATION_DURATION_MS!: number;
  public MIN_CUSTOM_VIDEO_BITRATE_BPS!: number;
  public MAX_CUSTOM_VIDEO_BITRATE_BPS!: number;
  public SUPPORTED_FRAME_RATES!: number[];
  public ALLOW_ADVANCED_NOISE_SUPPRESSION!: boolean;
  public ALLOW_AUDIO_ON_JOIN!: boolean;
  public ALLOW_MICROPHONE_CONTROL!: boolean;
  public MEETING_ROOM_ALLOW_ADVANCED_SETTINGS!: boolean;
  public WAITING_ROOM_ALLOW_ADVANCED_SETTINGS!: boolean;
  public WAITING_ROOM_ALLOW_DEVICE_SELECTION!: boolean;
  public ALLOW_ARCHIVING!: boolean;
  public ALLOW_CAPTIONS!: boolean;
  public ALLOW_CHAT!: boolean;
  public MEETING_ROOM_ALLOW_DEVICE_SELECTION!: boolean;
  public ALLOW_EMOJIS!: boolean;
  public ALLOW_SCREEN_SHARE!: boolean;
  public DEFAULT_LAYOUT_MODE!: LayoutMode;
  public SHOW_PARTICIPANT_LIST!: boolean;
  public SHOW_VIDEO_STATS!: boolean;
  public BYPASS_WAITING_ROOM!: boolean;
  public API_URL!: string;
  public TUNNEL_DOMAIN!: string | undefined;
  public AVOID_FETCHING_APP_CONFIG!: boolean;
  public MODE!: Mode;
  public VONAGE_VIDEO_HOST!: string | undefined;

  constructor(env: Record<string, unknown>) {
    this.raw = { ...env };
    this.initialRaw = { ...env };

    const parsed = envSchema.parse(env);
    Object.assign(this, parsed);

    this.setApiUrl(parsed.API_URL);
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
    this.I18N_SUPPORTED_LANGUAGES = langListField(this.I18N_FALLBACK_LANGUAGE).parse(value);
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
