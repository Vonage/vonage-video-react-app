import { DeepPartial } from '@app-types';
import appConfig from '@stores/appConfig';
import defaultAppConfig from '@stores/appConfig/helpers/defaultAppConfig';
import mergeAppConfigs from '@stores/appConfig/helpers/mergeAppConfigs';

export type AppConfigProviderWrapperOptions = Omit<
  Parameters<typeof appConfig.Provider.makeProviderWrapper>[0],
  'value'
> & {
  value?: DeepPartial<typeof defaultAppConfig>;
};

/**
 * Creates wrapper for the AppConfigProvider context.
 * Allows overriding context values via options and accessing the context value.
 * @param {object} options - The wrapper options.
 * @returns {object} The AppConfigProvider wrapper and context getter.
 */
function makeAppConfigProviderWrapper(options: AppConfigProviderWrapperOptions = {}) {
  const initialState = mergeAppConfigs({
    previous: defaultAppConfig,
    updates: {
      /**
       * This flag marks the app config as loaded to prevent fetching it during tests.
       */
      isAppConfigLoaded: true,
      ...options.value,
    },
  });

  return appConfig.Provider.makeProviderWrapper({
    ...options,
    value: initialState,
  });
}

export default makeAppConfigProviderWrapper;
