import React, { type PropsWithChildren } from 'react';
import UserProvider from '@Context/user';
import { ThemeProvider } from '@ui/theme';

type AppContextProviderProps = PropsWithChildren;

const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  );
};

export default AppContextProvider;
