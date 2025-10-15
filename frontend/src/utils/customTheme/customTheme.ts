import { createTheme } from '@mui/material';

// Material Design Color Palette
const colors = {
  // Primary colors
  primary: '#3E007E',
  onPrimary: '#FFFFFF',
  primaryContainer: '#6300C4',
  onPrimaryContainer: '#FFFFFF',
  surfaceTint: '#7F02F7',

  // Secondary colors
  secondary: '#2F293B',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#4C4659',
  onSecondaryContainer: '#FFFFFF',

  // Tertiary colors (mapped to warning)
  tertiary: '#2A005E',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#440291',
  onTertiaryContainer: '#F7EDFF',

  // Error colors
  error: '#600004',
  onError: '#FFFFFF',
  errorContainer: '#98000A',
  onErrorContainer: '#FFFFFF',

  // Surface colors
  background: '#FEF7FF',
  onBackground: '#1E1925',
  surface: '#FCF8F8',
  onSurface: '#000000',
  surfaceVariant: '#E0E3E3',
  onSurfaceVariant: '#000000',
  surfaceContainer: '#E5E2E1',
  surfaceContainerHigh: '#D7D4D3',
  surfaceContainerHighest: '#C9C6C5',

  // Outline colors
  outline: '#292D2D',
  outlineVariant: '#464A4A',

  // Inverse colors
  inverseSurface: '#313030',
  inverseOnSurface: '#FFFFFF',
  inversePrimary: '#D6BAFF',

  // Shadow and scrim
  shadow: '#000000',
  scrim: '#000000',
} as const;

// Typography
const fonts = {
  family: ['system-ui', 'ui-sans-serif', 'Inter', 'Marker Felt', 'Trebuchet MS'].join(','),
} as const;

// Box shadows (Material Design elevation)
const shadows = {
  level1:
    '0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12)',
  level2:
    '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)',
  level3:
    '0 5px 5px -3px rgba(0,0,0,0.2), 0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12)',
} as const;

// Helper functions for colors with transparency
const rgba = (color: string, alpha: number) => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 2), 16);
  const b = parseInt(hex.substring(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      contrastText: colors.onPrimary,
      dark: colors.primaryContainer,
      light: colors.surfaceTint,
    },
    secondary: {
      main: colors.secondary,
      contrastText: colors.onSecondary,
      dark: colors.secondaryContainer,
    },
    warning: {
      main: colors.tertiary,
      contrastText: colors.onTertiary,
      dark: colors.tertiaryContainer,
    },
    error: {
      main: colors.error,
      contrastText: colors.onError,
      dark: colors.errorContainer,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.onBackground,
      secondary: colors.onSurface,
    },
    divider: colors.outline,
  },
  components: {
    // AppBar overrides
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          color: colors.onSurface,
        },
      },
    },
    // Paper overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surfaceContainer,
          color: colors.onSurface,
        },
      },
    },
    // TextField overrides
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: colors.outline,
            },
            '&:hover fieldset': {
              borderColor: colors.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
    // Tooltip overrides
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.inverseSurface,
          color: colors.inverseOnSurface,
        },
      },
    },
  },
  typography: {
    fontFamily: fonts.family,
  },
});

export default customTheme;

// Export colors and utilities for use in other files
export { colors, fonts, shadows, rgba };
