import React, { type PropsWithChildren } from 'react';
import UserProvider from '@Context/user';
import { ThemeProvider, type ThemeProviderProps } from '@ui/theme';
import { runtime$ } from '@core/stores';
import { videoClient } from './services';

type AppContextProviderProps = PropsWithChildren<ThemeProviderProps>;

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, container }) => {
  return (
    <ThemeProvider container={container}>
      <runtime$.Provider videoClient={videoClient}>
        <UserProvider>{children}</UserProvider>
      </runtime$.Provider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
