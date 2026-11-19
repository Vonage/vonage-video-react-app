import { z } from 'zod';

export enum AdvancedSettingsScreenShareSurface {
  default = 'default',
  browser = 'browser',
  window = 'window',
  monitor = 'monitor',
}

export const screenShareSurfaceSchema = z.enum(AdvancedSettingsScreenShareSurface);

export default screenShareSurfaceSchema;
