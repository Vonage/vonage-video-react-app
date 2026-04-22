import type { Theme, ThemeColors } from '@ui/theme';
import designTokens from './designTokens';

const getTokensByMode = (mode: 'light' | 'dark'): Theme => {
  const colors = mode === 'light' ? designTokens.color.light : designTokens.color.dark;

  return {
    /**
     * { primary: string; onPrimary: string; secondary: string; onSecondary: string; ...  }
     */
    colors: Object.keys(colors).reduce((acc, originalKey): ThemeColors => {
      let key = originalKey;

      if (key.includes('-')) {
        key = key.replaceAll(/-([a-z])/g, (_, char: string) => char.toUpperCase());
      }

      acc[key as keyof ThemeColors] = colors[originalKey as keyof typeof colors].value;

      return acc;
    }, {} as ThemeColors),

    border: {
      borderRadiusNone: designTokens.border.none.value,
      borderRadiusExtraSmall: designTokens.border['extra-small'].value,
      borderRadiusSmall: designTokens.border.small.value,
      borderRadiusMedium: designTokens.border.medium.value,
      borderRadiusLarge: designTokens.border.large.value,
      borderRadiusExtraLarge: designTokens.border['extra-large'].value,
    },

    typography: designTokens.typography,
  };
};

export default getTokensByMode;
