import { ThemeProvider as ThemeProviderBase } from '@mui/material';
import React, { PropsWithChildren, useState } from 'react';
import getTokensByMode, { ThemeTokens } from './helpers/getTokensByMode';
import isDarkMode from './helpers/isDarkMode';
import useSynchronizeThemeAndMedia from './hooks/useSynchronizeThemeAndMedia';
import getMuiCustomTheme from './helpers/getMuiCustomTheme';

const themeContext = React.createContext<ThemeTokens>(getTokensByMode('light'));

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [tokens, setTokens] = useState(() => {
    return isDarkMode() ? getTokensByMode('dark') : getTokensByMode('light');
  });

  const theme = getMuiCustomTheme({ tokens });

  useSynchronizeThemeAndMedia({ setTokens });

  return (
    <themeContext.Provider value={tokens}>
      <ThemeProviderBase theme={theme}>{children}</ThemeProviderBase>
    </themeContext.Provider>
  );
};

export default themeContext;
