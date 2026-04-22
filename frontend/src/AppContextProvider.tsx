import React, { type PropsWithChildren } from 'react';
import UserProvider from '@Context/user';
import { ThemeProvider, type ThemeProviderPropsBase } from '@ui/theme';

type AppContextProviderProps = PropsWithChildren<ThemeProviderPropsBase>;

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, theme }) => {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
