import { AppConfigApi } from '@Context/AppConfig/actions/loadAppConfig';
import React, { type PropsWithChildren } from 'react';
import appConfig, { AppConfig } from '@Context/AppConfig';
import UserProvider from '@Context/user';
import mergeAppConfigs from '@Context/AppConfig/helpers/mergeAppConfigs';
import { DeepPartial } from './types';
import { ThemeProvider } from '@ui/theme';

type AppContextProviderProps = PropsWithChildren<{ appConfigValue?: DeepPartial<AppConfig> }>;

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, appConfigValue }) => {
  return (
    <ThemeProvider>
      <appConfig.Provider value={mergeAppConfigs(appConfigValue)} onCreated={fetchAppConfiguration}>
        <UserProvider>{children}</UserProvider>
      </appConfig.Provider>
    </ThemeProvider>
  );
};

/**
 * Fetches the app static configuration if it has not been loaded yet.
 * @param {AppConfigApi} context - The AppConfig context.
 */
function fetchAppConfiguration(context: AppConfigApi): void {
  const { isAppConfigLoaded } = context.getState();

  if (isAppConfigLoaded) {
    return;
  }

  context.actions.loadAppConfig();
}

export default AppContextProvider;
