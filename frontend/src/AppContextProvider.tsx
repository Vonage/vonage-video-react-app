import React, { type PropsWithChildren } from 'react';
import UserProvider from '@Context/user';
import { ThemeProvider } from '@ui/theme';
import { ThemeProviderPropsBase } from '@ui/theme/themeContext';
import { runtime$ } from '@core/stores';
import { videoClient } from './services';

type AppContextProviderProps = PropsWithChildren<ThemeProviderPropsBase>;

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, theme }) => {
  return (
    <ThemeProvider theme={theme}>
      <runtime$.Provider videoClient={videoClient}>
        <UserProvider>{children}</UserProvider>
      </runtime$.Provider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
