import { ThemeProvider as ThemeProviderBase, CssBaseline } from '@mui/material';
import React, { PropsWithChildren, useMemo, useState } from 'react';
import getTokensByMode from './helpers/getTokensByMode';
import isDarkMode from './helpers/isDarkMode';
import useSynchronizeThemeAndMedia from './hooks/useSynchronizeThemeAndMedia';
import getMuiCustomTheme from './helpers/getMuiCustomTheme';
import Theme, { PartialTheme } from './themeContext.types';

const defaultLightValue = getTokensByMode('light');
const defaultDarkValue = getTokensByMode('dark');

const themeContext = React.createContext<Theme>(defaultLightValue);

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

  const muiTheme = getMuiCustomTheme({ tokens });

  useSynchronizeThemeAndMedia({ setTokens });

  return (
    <themeContext.Provider value={tokens}>
      <CssBaseline />
      <ThemeProviderBase theme={muiTheme}>{children}</ThemeProviderBase>
    </themeContext.Provider>
  );
};

function mergeThemeConfigurations({
  defaultValue,
  overrides = {},
}: {
  defaultValue: Theme;
  overrides: PartialTheme;
}): Theme {
  const typeface = {
    ...defaultValue.typography.typeface,
    ...overrides.typography?.typeface,
  } as Theme['typography']['typeface'];

  const typeScale = {
    ...defaultValue.typography.typeScale,
    ...overrides.typography?.typeScale,
  } as Theme['typography']['typeScale'];

  const weight = {
    ...defaultValue.typography.weight,
    ...overrides.typography?.weight,
  } as Theme['typography']['weight'];

  return {
    colors: {
      ...defaultValue.colors,
      ...overrides.colors,
    },
    shapes: {
      ...defaultValue.shapes,
      ...overrides.shapes,
    },
    typography: {
      typeface,
      typeScale,
      weight,
    },
  };
}

export default themeContext;
