import React, { type PropsWithChildren } from 'react';
import UserProvider from '@Context/user';
import { ThemeProvider } from '@ui/theme';
import { ThemeProviderPropsBase } from '@ui/theme/themeContext';

type AppContextProviderProps = PropsWithChildren<ThemeProviderPropsBase>;

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children, theme }) => {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
