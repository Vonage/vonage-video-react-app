import { DeepPartial } from '@app-types/index';
import {
  type AppConfig,
  AppConfigProvider,
  mergeAppConfigs,
  defaultAppConfig,
} from '@Context/AppConfig';

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
    AppConfigProvider.makeProviderWrapper({
      value: initialState,
    });

  return { AppConfigWrapper, appConfigContext };
}

export default makeAppConfigProviderWrapper;
