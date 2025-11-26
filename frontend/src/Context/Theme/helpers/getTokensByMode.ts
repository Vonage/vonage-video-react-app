import designTokens from '../../../designTokens';

export type ThemeTokens = ReturnType<typeof getTokensByMode>;

type ColorKey = Camelize<keyof typeof designTokens.color.light>;

const getTokensByMode = (mode: 'light' | 'dark') => {
  const colors = mode === 'light' ? designTokens.color.light : designTokens.color.dark;

  return {
    /**
     * { primary: string; onPrimary: string; secondary: string; onSecondary: string; ...  }
     */
    colors: Object.keys(colors).reduce(
      (acc, originalKey) => {
        let key = originalKey;

        if (key.includes('-')) {
          key = key.replaceAll(/-([a-z])/g, (_, char: string) => char.toUpperCase());
        }

        acc[key as ColorKey] = colors[originalKey as keyof typeof colors].value;
        return acc;
      },
      {} as Record<ColorKey, string>
    ),

    shapes: {
      borderRadiusNone: designTokens.shape.none.value,
      borderRadiusExtraSmall: designTokens.shape['extra-small'].value,
      borderRadiusSmall: designTokens.shape.small.value,
      borderRadiusMedium: designTokens.shape.medium.value,
      borderRadiusLarge: designTokens.shape.large.value,
      borderRadiusExtraLarge: designTokens.shape['extra-large'].value,
    },

    typography: designTokens.typography,
  };
};

export default getTokensByMode;
