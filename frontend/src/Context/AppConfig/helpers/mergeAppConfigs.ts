import type { DeepPartial } from '@app-types/index';
import type { AppConfig } from '../AppConfigContext.types';
import defaultAppConfig from './defaultAppConfig';

/**
 * Merge the config with the default app config.
 * @param {DeepPartial<AppConfig>} updates - Partial updates to apply to the app config.
 * @returns {AppConfig} The merged app config.
 */
function mergeAppConfigs(updates: DeepPartial<AppConfig>): AppConfig;

/**
 * Merge two app configs.
 * @param {{ previous: AppConfig; updates: DeepPartial<AppConfig> }} args - Object containing the previous app config and partial updates.
 * @param {AppConfig} args.previous - The previous app config.
 * @param {DeepPartial<AppConfig>} args.updates - Partial updates to apply to the app config.
 * @returns {AppConfig} The merged app config.
 */
function mergeAppConfigs(args: { previous: AppConfig; updates: DeepPartial<AppConfig> }): AppConfig;

function mergeAppConfigs(
  args:
    | {
        previous: AppConfig;
        updates: DeepPartial<AppConfig>;
      }
    | DeepPartial<AppConfig>
): AppConfig {
  const shouldUseDefault = !('previous' in args && 'updates' in args);
  const previous = shouldUseDefault ? defaultAppConfig : args.previous;
  const updates = shouldUseDefault ? args : args.updates;

  return {
    ...previous,
    ...updates,
    videoSettings: {
      ...previous.videoSettings,
      ...(updates.videoSettings || {}),
    },
    audioSettings: {
      ...previous.audioSettings,
      ...(updates.audioSettings || {}),
    },
    waitingRoomSettings: {
      ...previous.waitingRoomSettings,
      ...(updates.waitingRoomSettings || {}),
    },
    meetingRoomSettings: {
      ...previous.meetingRoomSettings,
      ...(updates.meetingRoomSettings || {}),
    },
  };
}

export default mergeAppConfigs;
