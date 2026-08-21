import { z } from 'zod';
import { LAYOUT_MODES, type LayoutMode } from './types/session';
import {
  assertNumericString,
  assertString,
  isEmptyString,
  isNil,
  isNumericString,
} from '@common/assertions';
import { assertLang, Lang, LangSchema, Resolution, ResolutionSchema } from '@common/schemas';
import { tryCatch } from '@common/execution';

type IEnvironmentVariables = z.infer<typeof EnvironmentVariablesSchema>;

type IEnvironmentVariablesArgs = {
  [K in keyof IEnvironmentVariables]?: unknown;
};

const EnvironmentVariablesSchema = z.object({
  I18N_FALLBACK_LANGUAGE: langField({ name: 'I18N_FALLBACK_LANGUAGE', default: Lang.EN }),
  I18N_SUPPORTED_LANGUAGES: langListField({ default: [Lang.EN] }),
  ENABLE_REPORT_ISSUE: boolean({ default: false }),
  ALLOW_BACKGROUND_EFFECTS: boolean({ default: true }),
  ALLOW_CAMERA_CONTROL: boolean({ default: true }),
  ALLOW_VIDEO_ON_JOIN: boolean({ default: true }),
  DEFAULT_RESOLUTION: ResolutionSchema.default(Resolution.HD_LANDSCAPE),
  PUBLISHER_MAX_RESOLUTION: ResolutionSchema.default(Resolution.FHD_LANDSCAPE),
  NOTIFICATION_DURATION_MS: integer({ default: 4_000 }),
  MIN_CUSTOM_VIDEO_BITRATE_BPS: integer({ default: 5_000 }),
  MAX_CUSTOM_VIDEO_BITRATE_BPS: integer({ default: 10_000_000 }),
  SUPPORTED_FRAME_RATES: intListField([30, 15, 7, 1]),
  ALLOW_ADVANCED_NOISE_SUPPRESSION: boolean({ default: true }),
  ALLOW_AUDIO_ON_JOIN: boolean({ default: true }),
  ALLOW_MICROPHONE_CONTROL: boolean({ default: true }),
  MEETING_ROOM_ALLOW_ADVANCED_SETTINGS: boolean({ default: false }),
  WAITING_ROOM_ALLOW_ADVANCED_SETTINGS: boolean({ default: false }),
  WAITING_ROOM_ALLOW_DEVICE_SELECTION: boolean({ default: true }),
  ALLOW_ARCHIVING: boolean({ default: true }),
  ARCHIVES_REFRESH_INTERVAL_MS: integer({ default: 5000 }),
  ALLOW_CAPTIONS: boolean({ default: true }),
  ALLOW_CHAT: boolean({ default: true }),
  MEETING_ROOM_ALLOW_DEVICE_SELECTION: boolean({ default: true }),
  ALLOW_EMOJIS: boolean({ default: true }),
  ALLOW_SCREEN_SHARE: boolean({ default: true }),
  DEFAULT_LAYOUT_MODE: z.preprocess(
    (v) => (v === undefined || v === null || v === '' ? 'active-speaker' : v),
    z.enum([...LAYOUT_MODES] as [LayoutMode, ...LayoutMode[]])
  ),
  SHOW_PARTICIPANT_LIST: boolean({ default: true }),
  SHOW_VIDEO_STATS: boolean({ default: false }),
  BYPASS_WAITING_ROOM: boolean({ default: false }),
  API_URL: z.preprocess((v) => (v === undefined || v === null || v === '' ? '' : v), z.string()),
  TUNNEL_DOMAIN: stringField({ optional: true }),
  MODE: z.preprocess(
    (v) => v ?? 'development',
    z.enum(['development', 'production', 'test'] as const)
  ),
  VONAGE_VIDEO_HOST: stringField({ optional: true }),
});

export class Env implements IEnvironmentVariables {
  private readonly initial: Partial<IEnvironmentVariables>;

  public ENABLE_REPORT_ISSUE!: boolean;
  public I18N_FALLBACK_LANGUAGE!: Lang;
  public I18N_SUPPORTED_LANGUAGES!: Lang[];
  public ALLOW_BACKGROUND_EFFECTS!: boolean;
  public ALLOW_CAMERA_CONTROL!: boolean;
  public ALLOW_VIDEO_ON_JOIN!: boolean;
  public DEFAULT_RESOLUTION!: Resolution;
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
  public TUNNEL_DOMAIN!: string | null;
  public MODE!: Mode;
  public VONAGE_VIDEO_HOST!: string | null;
  public ARCHIVES_REFRESH_INTERVAL_MS!: number;

  constructor(env: IEnvironmentVariablesArgs) {
    const parsed = EnvironmentVariablesSchema.parse(env);
    Object.assign(this, parsed);

    this.setApiUrl(parsed.API_URL);

    this.initial = Object.keys(parsed).reduce(
      (acc, key) => {
        acc[key] = parsed[key as keyof IEnvironmentVariables];
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  /**
   * Partially updates the environment variables at runtime.
   * Useful for testing different configurations without reloading the page.
   * @param {Partial<IEnvironmentVariables>} partial - An object containing the env variables to update.
   */
  partialUpdate(partial: Partial<IEnvironmentVariables>) {
    Object.assign(this, partial);
  }

  /**
   * Resets all environment variables to their initial values when the Env instance was created.
   * Useful for cleaning up after tests that call partialUpdate.
   */
  reset() {
    Object.assign(this, this.initial);
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
    this.I18N_SUPPORTED_LANGUAGES = langListField({ default: [Lang.EN] }).parse(value);
  }
}

type Mode = 'development' | 'production' | 'test';

function boolean(args: { default: boolean }) {
  return z.preprocess(
    (val) => (isNil(val) ? args.default : val === 'true' || val === true),
    z.boolean()
  );
}

function integer(args: { default: number }) {
  return z.preprocess((val) => (isNumericString(val) ? Number(val) : args.default), z.number());
}

function intListField(fallback: number[]) {
  return z.preprocess((val) => {
    if (isNil(val)) return fallback;

    assertString(val, 'Expected pipe-separated integer list');

    return val.split('|').map((v) => {
      assertNumericString(v, `Expected integer but got "${v}"`);
      return Number(v);
    });
  }, z.array(z.number().int().positive()));
}

function langField(args: { name: string; default: Lang }) {
  return z
    .preprocess((value): Lang => {
      assertString(value, `Invalid ${args.name}, expected a string but got ${typeof value}`);

      const lang = value.trim();
      assertLang(lang);

      return lang;
    }, LangSchema)
    .default(args.default);
}

function langListField(args: { default: Lang[] }) {
  const fieldName = 'I18N_SUPPORTED_LANGUAGES';
  const lang = langField({ name: fieldName, default: Lang.EN });
  const langs = z.array(lang);

  return z
    .preprocess((value): Lang[] => {
      if (isNil(value)) return args.default;

      assertString(
        value,
        `Invalid ${fieldName}, expected a pipe-separated string but got ${typeof value}`
      );

      return value.split('|').map((item) => lang.parse(item));
    }, langs)
    .default(args.default);
}

function stringField(args: { default?: string; optional: boolean }) {
  if (args.optional)
    return z.preprocess((val) => {
      if (!val) return null;
      assertString(val, 'Expected a string');
      return val.trim();
    }, z.string().nullable());

  return z
    .string()
    .trim()
    .refine((val) => !isEmptyString(val), {
      message: 'String cannot be empty',
    });
}

declare const __APP_ENV__: Record<string, string | undefined>;

const { env, envInitError } = (() => {
  const { result: env, error: envInitError } = tryCatch(() => new Env(__APP_ENV__), {} as Env);
  return { env, envInitError };
})();

export { env, envInitError };

export default env;
