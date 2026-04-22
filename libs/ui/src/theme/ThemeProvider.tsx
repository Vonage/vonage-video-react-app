import { ThemeProvider as ThemeProviderBase } from '@mui/material';
import React, { PropsWithChildren, useMemo } from 'react';
import useSynchronizeThemeAndMedia from './hooks/useSynchronizeThemeAndMedia/useSynchronizeThemeAndMedia';
import getMuiCustomTheme, { GetMuiCustomThemeProps } from './helpers/getMuiCustomTheme';

export type ThemeProviderProps = PropsWithChildren<GetMuiCustomThemeProps>;

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, container }) => {
  const theme = useMemo(() => getMuiCustomTheme({ container }), [container]);

  useSynchronizeThemeAndMedia();

  return <ThemeProviderBase theme={theme}>{children}</ThemeProviderBase>;
};

export default ThemeProvider;
