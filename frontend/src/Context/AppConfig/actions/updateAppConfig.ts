import type { DeepPartial } from '@app-types/index';
import type { AppConfig } from '../AppConfigContext.types';
import mergeAppConfigs from '../helpers/mergeAppConfigs';

export type AppConfigApi = import('../AppConfigContext').AppConfigApi;

/**
 * Partially updates the app config state
 * @param {DeepPartial<AppConfig>} updates - Partial updates to apply to the app config state.
 * @returns {Function} A function that updates the app config state.
 */
function updateAppConfig(this: AppConfigApi['actions'], updates: DeepPartial<AppConfig>) {
  return ({ setState }: AppConfigApi) => {
    setState((previous) => mergeAppConfigs({ previous, updates }));
  };
}

export default updateAppConfig;
