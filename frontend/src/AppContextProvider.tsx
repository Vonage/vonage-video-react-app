import { ThemeProvider } from '@mui/material';
import { AppConfigApi } from '@Context/AppConfig/actions/loadAppConfig';
import React, { type PropsWithChildren } from 'react';
import appConfig, { AppConfig } from '@Context/AppConfig';
import UserProvider from '@Context/user';
import customTheme from './utils/customTheme/customTheme';

type AppContextProviderProps = PropsWithChildren<{
  appConfigValue?: AppConfig;
}>;

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, appConfigValue }) => {
  return (
    <ThemeProvider theme={customTheme}>
      <appConfig.Provider value={appConfigValue} onCreated={fetchAppConfiguration}>
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
