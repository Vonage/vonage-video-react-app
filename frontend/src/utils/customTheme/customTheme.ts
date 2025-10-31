import { createTheme } from '@mui/material';

const colors = {
  // Primary colors
  primary: '#3E007E',
  primaryLight: '#9575CD',
  primaryHover: '#3E007E2F',
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
  background: '#FFFFFF',
  backgroundDisabled: '#f5f5f5',
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

  // Neutral colors
  darkGrey: '#202124',
} as const;

const fonts = {
  family: ['system-ui', 'ui-sans-serif', 'Inter', 'Marker Felt', 'Trebuchet MS'].join(','),
} as const;

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
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          color: colors.onSurface,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background,
          color: colors.onSurface,
        },
      },
    },
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

export { colors, fonts };
