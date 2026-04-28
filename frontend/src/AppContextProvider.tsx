import React, { type PropsWithChildren } from 'react';
import UserProvider from '@Context/user';
import { ThemeProvider, type ThemeProviderProps } from '@ui/theme';

type AppContextProviderProps = PropsWithChildren<ThemeProviderProps>;

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, container }) => {
  return (
    <ThemeProvider container={container}>
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
