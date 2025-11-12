import { createTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface TypeBackground {
    darkGrey: string;
  }
}

const borderRadiusStandard = '8px';
const borderRadiusStandardNumber = 2.85;
const inputHeight = 56;
const buttonFontSize = 16;
const h2FontWeight = 500;
const h5FontWeight = 500;

const buttonSx = {
  height: inputHeight,
  textTransform: 'none',
  borderRadius: borderRadiusStandard,
} as const;

const colors = {
  // Primary colors
  primary: '#871EFF',
  primaryLight: '#f3e9ff',
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
  error: '#E61D1D',
  onError: '#FFFFFF',
  errorContainer: '#FFEEF2',
  onErrorContainer: '#FFFFFF',

  // Surface colors
  background: '#FFFFFF',
  backgroundDisabled: '#f5f5f5',
  onBackground: '#1E1925',
  surface: '#FCF8F8',
  onSurface: '#000000',

  // Outline colors
  outline: '#E6E6E6',
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
  family: ['"Inter"', 'system-ui', 'ui-sans-serif', '"Marker Felt"', '"Trebuchet MS"'].join(','),
} as const;

const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
      contrastText: colors.onPrimary,
      dark: colors.primaryContainer,
      light: colors.primaryLight,
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
      darkGrey: colors.darkGrey,
    },
    text: {
      primary: colors.onBackground,
      secondary: colors.onSurface,
    },
    divider: colors.outline,
  },
  shape: {
    borderRadius: borderRadiusStandardNumber,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          ...buttonSx,
          fontSize: buttonFontSize,
        },
        outlined: {
          borderColor: colors.primary,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          paddingLeft: '0',
          paddingRight: '0',
          '@media (min-width: 600px)': {
            paddingLeft: 0,
            paddingRight: 0,
          },
        },
      },
    },
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          height: inputHeight,
          backgroundColor: colors.background,
          borderRadius: borderRadiusStandard,
          backgroundClip: 'padding-box',
          '&.Mui-error': {
            backgroundColor: colors.errorContainer,
          },
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
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: colors.onSurface,
          '&.Mui-error': {
            color: colors.onSurface,
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
    h2: { fontWeight: h2FontWeight },
    h5: { fontWeight: h5FontWeight },
  },
});

export default customTheme;

export { colors, fonts };
