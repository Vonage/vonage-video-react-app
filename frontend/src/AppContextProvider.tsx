import type { AppConfigApi } from '@stores/appConfig';
import React, { type PropsWithChildren } from 'react';
import appConfig, { type AppConfig, mergeAppConfigs } from '@stores/appConfig';
import UserProvider from '@Context/user';
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

  void context.actions.loadAppConfig();
}

export default AppContextProvider;
