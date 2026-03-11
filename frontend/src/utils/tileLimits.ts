import { env } from '../env';
import { isMobile } from './util';
import {
  MAX_TILES_GRID_VIEW_DESKTOP,
  MAX_TILES_GRID_VIEW_MOBILE,
  MAX_TILES_SPEAKER_VIEW_DESKTOP,
  MAX_TILES_SPEAKER_VIEW_MOBILE,
} from './constants';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storage';

export type DeviceType = 'desktop' | 'mobile';

export type TilePreference = {
  grid: number;
  speaker: number;
};

export type DeviceTileLimits = {
  grid: number;
  speaker: number;
};

export type TileLimitBounds = {
  grid: { min: number; max: number };
  speaker: { min: number; max: number };
};

const USER_CAPS: Record<DeviceType, TilePreference> = {
  desktop: { grid: 16, speaker: 9 },
  mobile: { grid: 6, speaker: 4 },
};

const USER_MINS: Record<DeviceType, TilePreference> = {
  desktop: { grid: 2, speaker: 1 },
  mobile: { grid: 1, speaker: 1 },
};

const BASE_LIMITS: Record<DeviceType, DeviceTileLimits> = {
  desktop: {
    grid: env.TILE_LIMIT_GRID_DESKTOP ?? MAX_TILES_GRID_VIEW_DESKTOP,
    speaker: env.TILE_LIMIT_SPEAKER_DESKTOP ?? MAX_TILES_SPEAKER_VIEW_DESKTOP,
  },
  mobile: {
    grid: env.TILE_LIMIT_GRID_MOBILE ?? MAX_TILES_GRID_VIEW_MOBILE,
    speaker: env.TILE_LIMIT_SPEAKER_MOBILE ?? MAX_TILES_SPEAKER_VIEW_MOBILE,
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const clampPreference = (preference: TilePreference, bounds: TileLimitBounds): TilePreference => ({
  grid: clamp(preference.grid, bounds.grid.min, bounds.grid.max),
  speaker: clamp(preference.speaker, bounds.speaker.min, bounds.speaker.max),
});

export const getDeviceType = (): DeviceType => (isMobile() ? 'mobile' : 'desktop');

export const getBoundsForDevice = (device: DeviceType): TileLimitBounds => ({
  grid: {
    min: USER_MINS[device].grid,
    max: Math.max(BASE_LIMITS[device].grid, USER_CAPS[device].grid),
  },
  speaker: {
    min: USER_MINS[device].speaker,
    max: Math.max(BASE_LIMITS[device].speaker, USER_CAPS[device].speaker),
  },
});

export const getEffectiveLimits = (
  device: DeviceType,
  preference: TilePreference
): { limits: DeviceTileLimits; bounds: TileLimitBounds } => {
  const bounds = getBoundsForDevice(device);
  const clamped = clampPreference(preference, bounds);
  return {
    bounds,
    limits: {
      grid: clamped.grid,
      speaker: clamped.speaker,
    },
  };
};

const parseStoredPreference = (raw: string | null): TilePreference | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.grid === 'number' &&
      typeof parsed.speaker === 'number'
    ) {
      return { grid: parsed.grid, speaker: parsed.speaker };
    }
    return null;
  } catch {
    return null;
  }
};

export const getInitialTilePreference = (device: DeviceType): TilePreference => {
  const stored = parseStoredPreference(getStorageItem(STORAGE_KEYS.TILE_DENSITY));
  const baseDefaults = BASE_LIMITS[device];
  if (!stored) {
    return { grid: baseDefaults.grid, speaker: baseDefaults.speaker };
  }
  const { bounds } = getEffectiveLimits(device, stored);
  return clampPreference(stored, bounds);
};

export const persistTilePreference = (preference: TilePreference) => {
  setStorageItem(STORAGE_KEYS.TILE_DENSITY, JSON.stringify(preference));
};

export const getBaseLimits = () => BASE_LIMITS;

export const normalizePreferenceForDevice = (preference: TilePreference, device: DeviceType) => {
  const { bounds } = getEffectiveLimits(device, preference);
  return clampPreference(preference, bounds);
};
