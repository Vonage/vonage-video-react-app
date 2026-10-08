#!/usr/bin/env tsx
/**
 * Generates the frontend env.sh from app-config.json (the source of truth).
 * Run: yarn sync:env
 *
 * env.sh is a generated artifact; do not edit it by hand. Update app-config.json instead.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const commandName = 'sync:env';

const configFilePath = path.resolve('app-config.json');
const outputFilePath = path.resolve('env.sh');

// 'string' is single-quoted; 'raw' is unquoted (booleans and numbers).
type ValueFormat = 'string' | 'raw';

type BaseEnvVariable = {
  name: string;
  format: ValueFormat;
  join?: string;
  comment?: string[];
};

type DerivedEnvVariable = BaseEnvVariable & {
  sourcePath: string;
  // Translates a shared config value to what the web app expects when the enums differ.
  valueMap?: Record<string, string>;
};

type LiteralEnvVariable = BaseEnvVariable & {
  literal: string | number | number[];
};

type EnvVariable = DerivedEnvVariable | LiteralEnvVariable;

const isLiteral = (variable: EnvVariable): variable is LiteralEnvVariable => 'literal' in variable;

// Order is significant: it defines the order of exports in the generated file.
const envVariables: EnvVariable[] = [
  { name: 'ENABLE_REPORT_ISSUE', sourcePath: 'appSettings.enableReportIssue', format: 'raw' },
  {
    name: 'I18N_FALLBACK_LANGUAGE',
    sourcePath: 'localizationSettings.fallbackLanguage',
    format: 'string',
  },
  {
    name: 'I18N_SUPPORTED_LANGUAGES',
    sourcePath: 'localizationSettings.supportedLanguages',
    format: 'string',
    join: '|',
  },
  {
    name: 'ALLOW_BACKGROUND_EFFECTS',
    sourcePath: 'videoSettings.allowBackgroundEffects',
    format: 'raw',
  },
  { name: 'ALLOW_CAMERA_CONTROL', sourcePath: 'videoSettings.allowCameraControl', format: 'raw' },
  { name: 'ALLOW_VIDEO_ON_JOIN', sourcePath: 'videoSettings.allowVideoOnJoin', format: 'raw' },
  { name: 'DEFAULT_RESOLUTION', sourcePath: 'videoSettings.defaultResolution', format: 'string' },
  // Web-only values: the shared app-config.json schema restricts extra keys to booleans, so these
  // cannot live in app-config.json.
  { name: 'PUBLISHER_MAX_RESOLUTION', literal: '1920x1080', format: 'string' },
  { name: 'NOTIFICATION_DURATION_MS', literal: 4000, format: 'raw' },
  { name: 'MIN_CUSTOM_VIDEO_BITRATE_BPS', literal: 5000, format: 'raw' },
  { name: 'MAX_CUSTOM_VIDEO_BITRATE_BPS', literal: 10000000, format: 'raw' },
  { name: 'SUPPORTED_FRAME_RATES', literal: [30, 15, 7, 1], format: 'string', join: '|' },
  {
    name: 'ALLOW_ADVANCED_NOISE_SUPPRESSION',
    sourcePath: 'audioSettings.allowAdvancedNoiseSuppression',
    format: 'raw',
  },
  { name: 'ALLOW_AUDIO_ON_JOIN', sourcePath: 'audioSettings.allowAudioOnJoin', format: 'raw' },
  {
    name: 'ALLOW_MICROPHONE_CONTROL',
    sourcePath: 'audioSettings.allowMicrophoneControl',
    format: 'raw',
  },
  {
    name: 'MEETING_ROOM_ALLOW_DEVICE_SELECTION',
    sourcePath: 'meetingRoomSettings.allowDeviceSelection',
    format: 'raw',
  },
  {
    name: 'WAITING_ROOM_ALLOW_DEVICE_SELECTION',
    sourcePath: 'waitingRoomSettings.allowDeviceSelection',
    format: 'raw',
  },
  {
    name: 'BYPASS_WAITING_ROOM',
    sourcePath: 'waitingRoomSettings.bypassWaitingRoom',
    format: 'raw',
  },
  { name: 'ALLOW_ARCHIVING', sourcePath: 'meetingRoomSettings.allowArchiving', format: 'raw' },
  { name: 'ALLOW_CAPTIONS', sourcePath: 'meetingRoomSettings.allowCaptions', format: 'raw' },
  { name: 'ALLOW_CHAT', sourcePath: 'meetingRoomSettings.allowChat', format: 'raw' },
  { name: 'ALLOW_EMOJIS', sourcePath: 'meetingRoomSettings.allowEmojis', format: 'raw' },
  { name: 'ALLOW_SCREEN_SHARE', sourcePath: 'meetingRoomSettings.allowScreenShare', format: 'raw' },
  {
    name: 'DEFAULT_LAYOUT_MODE',
    sourcePath: 'meetingRoomSettings.defaultLayoutMode',
    format: 'string',
    // Schema enum is 'activeSpeaker'; the web app expects 'active-speaker'.
    valueMap: { activeSpeaker: 'active-speaker' },
  },
  {
    name: 'SHOW_PARTICIPANT_LIST',
    sourcePath: 'meetingRoomSettings.showParticipantList',
    format: 'raw',
  },
  {
    name: 'MEETING_ROOM_ALLOW_ADVANCED_SETTINGS',
    sourcePath: 'meetingRoomSettings.allowSettings',
    format: 'raw',
  },
  {
    name: 'WAITING_ROOM_ALLOW_ADVANCED_SETTINGS',
    sourcePath: 'waitingRoomSettings.allowSettings',
    format: 'raw',
  },
  // Backend auth defaults for DEV. Consumed by backend/helpers/config.ts and overridable via
  // backend/.env (see docs/AUTHENTICATION.md).
  { name: 'AUTH_HEADER_NAME', literal: 'authorization', format: 'string' },
  { name: 'AUTH_SCHEME', literal: 'Bearer', format: 'string' },
  { name: 'OIDC_INTROSPECT_PATH', literal: '/oauth2/v1/introspect', format: 'string' },
  { name: 'OIDC_AUTHORIZE_PATH', literal: '/oauth2/v1/authorize', format: 'string' },
  { name: 'OIDC_TOKEN_PATH', literal: '/oauth2/v1/token', format: 'string' },
  { name: 'AUTH_INTROSPECTION_TIMEOUT_MS', literal: 5000, format: 'raw' },
  {
    name: 'OIDC_ISSUER_URL',
    literal: 'https://launchpadtest.vonage.com',
    format: 'string',
    comment: [
      'DEV Okta tenant (SPA/public client — issuer URL and client ID are non-secret), one shared',
      'app registration for Mobile + Web. Override via backend/.env for PROD, which has its own',
      'issuer and client ID (see docs/CONFIGURATION.md).',
    ],
  },
  { name: 'OIDC_CLIENT_ID', literal: '0oa2sp68ck6PDehU40h8', format: 'string' },
  {
    name: 'OIDC_WEB_REDIRECT_URI',
    literal: 'http://localhost:5173/api/auth/callback/okta',
    format: 'string',
  },
];

function readConfig(): Record<string, unknown> {
  if (!fs.existsSync(configFilePath)) {
    console.error(`\x1b[31m✖ Config source not found at ${configFilePath}\x1b[0m`);
    process.exit(1);
  }

  const raw = fs.readFileSync(configFilePath, 'utf-8');

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (error) {
    console.error(`\x1b[31m✖ Failed to parse ${configFilePath} as JSON\x1b[0m`, error);
    process.exit(1);
  }
}

function resolvePath(config: Record<string, unknown>, sourcePath: string): unknown {
  const value = sourcePath.split('.').reduce<unknown>((current, key) => {
    if (current === null || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, config);

  if (value === undefined) {
    console.error(`\x1b[31m✖ Missing value in app-config.json for path "${sourcePath}"\x1b[0m`);
    process.exit(1);
  }

  return value;
}

function escapeSingleQuoted(value: string): string {
  return value.replaceAll("'", String.raw`'\''`);
}

function serializeValue(value: unknown, args: { format: ValueFormat; join?: string }): string {
  const scalar = Array.isArray(value) ? value.join(args.join ?? '|') : String(value);

  return args.format === 'string' ? `'${escapeSingleQuoted(scalar)}'` : scalar;
}

function resolveValue(variable: EnvVariable, config: Record<string, unknown>): unknown {
  if (isLiteral(variable)) return variable.literal;

  const value = resolvePath(config, variable.sourcePath);

  if (variable.valueMap && typeof value === 'string' && value in variable.valueMap) {
    return variable.valueMap[value];
  }

  return value;
}

function buildEnvFileContents(config: Record<string, unknown>): string {
  const exportLines = envVariables.flatMap((variable) => {
    const value = resolveValue(variable, config);
    const commentLines = (variable.comment ?? []).map((line) => `# ${line}`);

    return [...commentLines, `export ${variable.name}=${serializeValue(value, variable)}`];
  });

  return ['#!/bin/bash', '', ...exportLines, ''].join('\n');
}

const generateEnv = () => {
  console.log(`\x1b[36m🔄 [${commandName}] Generating env.sh from app-config.json\x1b[0m\n`);

  const config = readConfig();
  const contents = buildEnvFileContents(config);

  fs.writeFileSync(outputFilePath, contents, 'utf-8');

  console.log(`\x1b[32m✔ [${commandName}] Wrote ${outputFilePath}\x1b[0m`);
};

generateEnv();
