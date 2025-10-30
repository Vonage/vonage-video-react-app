import type { DeepPartial } from '@app-types/index';
import type { AppConfig } from '../AppConfigContext.types';
import mergeAppConfigs from '../helpers/mergeAppConfigs';

export type AppConfigActions = import('../AppConfigContext').AppConfigActions;
export type AppConfigContext = import('../AppConfigContext').AppConfigContextType;

/**
 * Partially updates the app config state
 * @param {DeepPartial<AppConfig>} updates - Partial updates to apply to the app config state.
 * @returns {Function} A function that updates the app config state.
 */
function updateAppConfig(this: AppConfigActions, updates: DeepPartial<AppConfig>) {
  return ({ setState }: AppConfigContext) => {
    setState((previous) => mergeAppConfigs({ previous, updates }));
  };
}

export default updateAppConfig;
