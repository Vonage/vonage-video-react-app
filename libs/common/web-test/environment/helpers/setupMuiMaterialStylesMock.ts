import { isRecord } from '@common/assertions';
import { vi } from 'vitest';

vi.mock('@mui/material/styles', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/material/styles')>();

  function createTheme(...args: Parameters<typeof actual.createTheme>) {
    const [themeOptions, ...rest] = args;

    const sanitizedThemeOptions = (() => {
      const { cssVariables } = themeOptions || {};

      if (isRecord(cssVariables) && cssVariables.colorSchemeSelector === ':host(.%s)') {
        return {
          ...themeOptions,
          cssVariables: true,
        };
      }

      return themeOptions;
    })();

    return actual.createTheme(sanitizedThemeOptions, ...rest);
  }

  return {
    ...actual,
    createTheme,
  };
});
