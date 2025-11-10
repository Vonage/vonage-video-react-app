import { DeepPartial } from '@app-types/index';
import appConfig, { type AppConfig } from '@Context/AppConfig';
import defaultAppConfig from '@Context/AppConfig/helpers/defaultAppConfig';
import mergeAppConfigs from '@Context/AppConfig/helpers/mergeAppConfigs';

export type AppConfigProviderWrapperOptions = {
  value?: DeepPartial<AppConfig>;
};

/**
 * Creates wrapper for the AppConfigProvider context.
 * Allows overriding context values via options and accessing the context value.
 * @param {object} appConfigOptions - The wrapper options.
 * @returns {object} The AppConfigProvider wrapper and context getter.
 */
function makeAppConfigProviderWrapper(appConfigOptions?: AppConfigProviderWrapperOptions) {
  const initialState = mergeAppConfigs({
    previous: defaultAppConfig,
    updates: {
      /**
       * This flag marks the app config as loaded to prevent fetching it during tests.
       */
      isAppConfigLoaded: true,
      ...appConfigOptions?.value,
    },
  });

  const { wrapper: AppConfigWrapper, context: appConfigContext } =
    appConfig.Provider.makeProviderWrapper({
      value: initialState,
    });

  return { AppConfigWrapper, appConfigContext };
}

export default makeAppConfigProviderWrapper;
