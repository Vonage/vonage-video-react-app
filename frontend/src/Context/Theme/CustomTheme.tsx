import { useTheme } from '@mui/material';
import { useMemo } from 'react';
import designTokens from '../../designTokens';

const useCustomTheme = () => {
  const theme = useTheme();

  return useMemo(() => {
    const colors = {
      primary: designTokens.color.light.primary.value,
      textPrimary: designTokens.color.light['text-primary'].value,
      onPrimary: designTokens.color.light['on-primary'].value,
      primaryHover: designTokens.color.light['primary-hover'].value,

      secondary: designTokens.color.light.secondary.value,
      textSecondary: designTokens.color.light['text-secondary'].value,
      onSecondary: designTokens.color.light['on-secondary'].value,

      tertiary: designTokens.color.light.tertiary.value,
      textTertiary: designTokens.color.light['text-tertiary'].value,
      onTertiary: designTokens.color.light['on-tertiary'].value,

      background: designTokens.color.light.background.value,
      onBackground: designTokens.color.light['on-background'].value,

      surface: designTokens.color.light.surface.value,
      onSurface: designTokens.color.light['on-surface'].value,

      error: designTokens.color.light.error.value,
      onError: designTokens.color.light['on-error'].value,
      errorHover: designTokens.color.light['error-hover'].value,

      warning: designTokens.color.light.warning.value,
      onWarning: designTokens.color.light['on-warning'].value,
      warningHover: designTokens.color.light['warning-hover'].value,

      success: designTokens.color.light.success.value,
      onSuccess: designTokens.color.light['on-success'].value,
      successHover: designTokens.color.light['success-hover'].value,

      border: designTokens.color.light.border.value,
      disabled: designTokens.color.light.disabled.value,
      textDisabled: designTokens.color.light['text-disabled'].value,
    };
    const shapes = {
      borderRadiusNone: parseFloat(designTokens.shape.none.value) / 2.828,
      borderRadiusExtraSmall: parseFloat(designTokens.shape['extra-small'].value) / 2.828,
      borderRadiusSmall: parseFloat(designTokens.shape.small.value) / 2.828,
      borderRadiusMedium: parseFloat(designTokens.shape.medium.value) / 2.828,
      borderRadiusLarge: parseFloat(designTokens.shape.large.value) / 2.828,
      borderRadiusExtraLarge: parseFloat(designTokens.shape['extra-large'].value) / 2.828,
    };

    return {
      colors,
      shapes,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.palette.mode]); // Update on dark/light mode change
};

export default useCustomTheme;
