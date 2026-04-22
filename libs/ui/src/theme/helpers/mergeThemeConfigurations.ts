import Theme, { PartialTheme } from '../ThemeProvider.types';

export function mergeThemeConfigurations({
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
    border: {
      ...defaultValue.border,
      ...overrides.border,
    },
    typography: {
      typeface,
      typeScale,
      weight,
    },
  };
}
