import { ThemeProvider as ThemeProviderBase, CssBaseline } from '@mui/material';
import React, { PropsWithChildren, useMemo, useState } from 'react';
import getTokensByMode from './helpers/getTokensByMode';
import isDarkMode from './helpers/isDarkMode';
import useSynchronizeThemeAndMedia from './hooks/useSynchronizeThemeAndMedia';
import getMuiCustomTheme from './helpers/getMuiCustomTheme';
import Theme, { PartialTheme } from './themeContext.types';
import { mergeThemeConfigurations } from './helpers/mergeThemeConfigurations';

const defaultLightValue: Theme = getTokensByMode('light');
const defaultDarkValue: Theme = getTokensByMode('dark');

const themeContext = React.createContext(defaultLightValue);

export type ThemeProviderProps = PropsWithChildren & {
  theme?: {
    lightMode: PartialTheme;
    darkMode?: PartialTheme;
  };
};

export const ThemeProvider: React.FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  theme,
}) => {
  const themeSource: {
    light: Theme;
    dark: Theme;
  } = useMemo(() => {
    return {
      light: mergeThemeConfigurations({
        defaultValue: defaultLightValue,
        overrides: theme?.lightMode ?? {},
      }),
      dark: mergeThemeConfigurations({
        defaultValue: defaultDarkValue,
        overrides: theme?.darkMode ?? {},
      }),
    };
  }, [theme]);

  const [tokens, setTokens] = useState<Theme>(() => {
    return isDarkMode() ? themeSource.dark : themeSource.light;
  });

  const muiTheme = useMemo(() => getMuiCustomTheme({ tokens }), [tokens]);

  useSynchronizeThemeAndMedia({ setTokens });

  return (
    <themeContext.Provider value={tokens}>
      <CssBaseline />
      <ThemeProviderBase theme={muiTheme}>{children}</ThemeProviderBase>
    </themeContext.Provider>
  );
};

export default themeContext;
