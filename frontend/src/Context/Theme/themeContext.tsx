import { ThemeProvider } from '@mui/material';
import React, { PropsWithChildren, useState } from 'react';
import getTokensByMode, { ThemeTokens } from './helpers/getTokensByMode';
import isDarkMode from './helpers/isDarkMode';
import useSynchronizeThemeAndMedia from './hooks/useSynchronizeThemeAndMedia';
import getMuiCustomTheme from './helpers/getMuiCustomTheme';

const themeContext = React.createContext<ThemeTokens>(getTokensByMode('light'));

export const CustomThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [tokens, setTokens] = useState(() => {
    return isDarkMode() ? getTokensByMode('dark') : getTokensByMode('light');
  });

  const theme = getMuiCustomTheme({ tokens });

  useSynchronizeThemeAndMedia({ setTokens });

  return (
    <themeContext.Provider value={tokens}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </themeContext.Provider>
  );
};

export default themeContext;
