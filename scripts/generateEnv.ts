#!/usr/bin/env tsx
/**
 * Generates the frontend env.sh from env.json (the source of truth).
 * Run: yarn sync:env
 *
 * env.sh is a generated artifact; do not edit it by hand. Update env.json instead.
 */

import * as fs from 'fs';
import * as path from 'path';

const commandName = 'sync:env';

const configFilePath = path.resolve('env.json');
const outputFilePath = path.resolve('env.sh');

// 'string' is single-quoted; 'raw' is unquoted (booleans and numbers).
type ValueFormat = 'string' | 'raw';

type DerivedEnvVariable = {
  name: string;
  sourcePath: string;
  format: ValueFormat;
  join?: string;
  // Translates a shared config value to what the web app expects when the enums differ.
  valueMap?: Record<string, string>;
};

type LiteralEnvVariable = {
  name: string;
  literal: string | number | number[];
  format: ValueFormat;
  join?: string;
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
  // Web-only values: the shared env.json schema restricts extra keys to booleans, so these
  // cannot live in env.json.
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
  { name: 'ALLOW_ARCHIVING', sourcePath: 'meetingRoomSettings.allowArchiving', format: 'raw' },
  { name: 'ALLOW_CAPTIONS', sourcePath: 'meetingRoomSettings.allowCaptions', format: 'raw' },
  { name: 'ALLOW_CHAT', sourcePath: 'meetingRoomSettings.allowChat', format: 'raw' },
  {
    name: 'DEVICE_SELECTION',
    sourcePath: 'meetingRoomSettings.allowDeviceSelection',
    format: 'raw',
  },
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
  { name: 'SHOW_VIDEO_STATS', sourcePath: 'appSettings.showVideoStats', format: 'raw' },
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
    console.error(`\x1b[31m✖ Missing value in env.json for path "${sourcePath}"\x1b[0m`);
    process.exit(1);
  }

  return value;
}

function serializeValue(value: unknown, args: { format: ValueFormat; join?: string }): string {
  const scalar = Array.isArray(value) ? value.join(args.join ?? '|') : String(value);

  return args.format === 'string' ? `'${scalar}'` : scalar;
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
  const exportLines = envVariables.map((variable) => {
    const value = resolveValue(variable, config);
    return `export ${variable.name}=${serializeValue(value, variable)}`;
  });

  return ['#!/bin/bash', '', ...exportLines].join('\n');
}

const generateEnv = () => {
  console.log(`\x1b[36m🔄 [${commandName}] Generating env.sh from env.json\x1b[0m\n`);

  const config = readConfig();
  const contents = buildEnvFileContents(config);

  fs.writeFileSync(outputFilePath, contents, 'utf-8');

  console.log(`\x1b[32m✔ [${commandName}] Wrote ${outputFilePath}\x1b[0m`);
};

generateEnv();
