import { createTheme, PaletteColor, PaletteColorOptions } from '@mui/material';
import designTokens from '../../designTokens';

declare module '@mui/material/styles' {
  interface TypeText {
    tertiary: string;
    main: string;
  }

  interface Palette {
    tertiary: PaletteColor;
    hover: PaletteColor;
    disabled: PaletteColor;
  }

  interface PaletteOptions {
    tertiary?: PaletteColorOptions;
    hover?: PaletteColorOptions;
    disabled?: PaletteColorOptions;
  }

  interface Shape {
    borderRadius: number;
    borderRadiusNone: number;
    borderRadiusExtraSmall: number;
    borderRadiusSmall: number;
    borderRadiusMedium: number;
    borderRadiusLarge: number;
    borderRadiusExtraLarge: number;
  }

  interface ThemeOptions {
    shape?: Partial<Shape>;
  }
}

function borderRadiusToNumber(value: string): number {
  const numericValue = parseFloat(value);

  if (value.includes('rem')) {
    // 1rem = 16px, MUI base spacing = 8px, so 1rem = 2 units
    return (numericValue * 16) / 8;
  }

  if (value.includes('px')) {
    // Convert px to MUI units (8px = 1 unit)
    return numericValue / 8;
  }

  return numericValue;
}

const buttonHeight = 40; // 40px

const buttonSx = {
  height: buttonHeight,
  textTransform: 'none',
  borderRadius: designTokens.shape.medium.value,
} as const;

const customTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: designTokens.color.light.primary.value,
      contrastText: designTokens.color.light['on-primary'].value,
      dark: designTokens.color.light.primary.value,
      light: designTokens.color.light.background.value,
    },
    secondary: {
      main: designTokens.color.light.secondary.value,
      contrastText: designTokens.color.light['on-secondary'].value,
      dark: designTokens.color.light.secondary.value,
      light: designTokens.color.light.background.value,
    },
    tertiary: {
      main: designTokens.color.light.tertiary.value,
      contrastText: designTokens.color.light['on-tertiary'].value,
      dark: designTokens.color.light.tertiary.value,
      light: designTokens.color.light.background.value,
    },
    success: {
      main: designTokens.color.light.success.value,
      contrastText: designTokens.color.light['on-success'].value,
      dark: designTokens.color.light['success-hover'].value,
      light: designTokens.color.light.background.value,
    },
    warning: {
      main: designTokens.color.light.warning.value,
      contrastText: designTokens.color.light['on-warning'].value,
      dark: designTokens.color.light['warning-hover'].value,
      light: designTokens.color.light.background.value,
    },
    error: {
      main: designTokens.color.light.error.value,
      contrastText: designTokens.color.light['on-error'].value,
      dark: designTokens.color.light['error-hover'].value,
      light: designTokens.color.light.background.value,
    },
    background: {
      default: designTokens.color.light.background.value,
      paper: designTokens.color.light.surface.value,
    },
    text: {
      primary: designTokens.color.light['text-secondary'].value, // This is the default text color
      main: designTokens.color.light['text-primary'].value, // This is primary color for specific uses
      secondary: designTokens.color.light['text-secondary'].value,
      tertiary: designTokens.color.light['text-tertiary'].value,
    },
    divider: designTokens.color.light.border.value,
    hover: {
      main: designTokens.color.light['primary-hover'].value,
    },
    disabled: {
      main: designTokens.color.light.disabled.value,
    },
  },
  shape: {
    borderRadius: borderRadiusToNumber(designTokens.shape.medium.value),
    borderRadiusNone: borderRadiusToNumber(designTokens.shape.none.value),
    borderRadiusExtraSmall: borderRadiusToNumber(designTokens.shape['extra-small'].value),
    borderRadiusSmall: borderRadiusToNumber(designTokens.shape.small.value),
    borderRadiusMedium: borderRadiusToNumber(designTokens.shape.medium.value),
    borderRadiusLarge: borderRadiusToNumber(designTokens.shape.large.value),
    borderRadiusExtraLarge: borderRadiusToNumber(designTokens.shape['extra-large'].value),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          ...buttonSx,
          fontSize: designTokens.typography.typeScale.desktop['body-extended'].fontSize.value,
        },
        outlined: {
          borderColor: designTokens.color.light.primary.value,
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
          backgroundColor: designTokens.color.light.surface.value,
          color: designTokens.color.light['on-surface'].value,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: designTokens.color.light.background.value,
          color: designTokens.color.light['on-background'].value,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: designTokens.color.light.background.value,
          borderRadius: designTokens.shape.medium.value,
          backgroundClip: 'padding-box',
          '&.Mui-error': {
            backgroundColor: designTokens.color.light['error-hover'].value,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: designTokens.color.light['on-surface'].value,
          '&.Mui-error': {
            color: designTokens.color.light['on-surface'].value,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile.headline.fontSize.value} * 1.5)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile.headline.lineHeight.value} * 1.5)`,
            fontWeight: designTokens.typography.typeScale.mobile.headline.fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize: designTokens.typography.typeScale.mobile.headline.fontSize.value,
            lineHeight: designTokens.typography.typeScale.mobile.headline.lineHeight.value,
            fontWeight: designTokens.typography.typeScale.mobile.headline.fontWeight.value,
          },
        },
        h2: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile.subtitle.fontSize.value} * 1.15)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile.subtitle.lineHeight.value} * 1.15)`,
            fontWeight: designTokens.typography.typeScale.mobile.subtitle.fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize: designTokens.typography.typeScale.mobile.subtitle.fontSize.value,
            lineHeight: designTokens.typography.typeScale.mobile.subtitle.lineHeight.value,
            fontWeight: designTokens.typography.typeScale.mobile.subtitle.fontWeight.value,
          },
        },
        h3: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile['heading-1'].fontSize.value} * 1.15)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile['heading-1'].lineHeight.value} * 1.15)`,
            fontWeight: designTokens.typography.typeScale.mobile['heading-1'].fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize: designTokens.typography.typeScale.mobile['heading-1'].fontSize.value,
            lineHeight: designTokens.typography.typeScale.mobile['heading-1'].lineHeight.value,
            fontWeight: designTokens.typography.typeScale.mobile['heading-1'].fontWeight.value,
          },
        },
        h4: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile['heading-2'].fontSize.value} * 1.15)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile['heading-2'].lineHeight.value} * 1.15)`,
            fontWeight: designTokens.typography.typeScale.mobile['heading-2'].fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize: designTokens.typography.typeScale.mobile['heading-2'].fontSize.value,
            lineHeight: designTokens.typography.typeScale.mobile['heading-2'].lineHeight.value,
            fontWeight: designTokens.typography.typeScale.mobile['heading-2'].fontWeight.value,
          },
        },
        h5: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile['heading-3'].fontSize.value} * 1.15)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile['heading-3'].lineHeight.value} * 1.15)`,
            fontWeight: designTokens.typography.typeScale.mobile['heading-3'].fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize: designTokens.typography.typeScale.mobile['heading-3'].fontSize.value,
            lineHeight: designTokens.typography.typeScale.mobile['heading-3'].lineHeight.value,
            fontWeight: designTokens.typography.typeScale.mobile['heading-3'].fontWeight.value,
          },
        },
        h6: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile['heading-4'].fontSize.value} * 1.15)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile['heading-4'].lineHeight.value} * 1.15)`,
            fontWeight: designTokens.typography.typeScale.mobile['heading-4'].fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize: designTokens.typography.typeScale.mobile['heading-4'].fontSize.value,
            lineHeight: designTokens.typography.typeScale.mobile['heading-4'].lineHeight.value,
            fontWeight: designTokens.typography.typeScale.mobile['heading-4'].fontWeight.value,
          },
        },
        subtitle1: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile['body-extended-semibold'].fontSize.value} * 1.15)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile['body-extended-semibold'].lineHeight.value} * 1.15)`,
            fontWeight:
              designTokens.typography.typeScale.mobile['body-extended-semibold'].fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize:
              designTokens.typography.typeScale.mobile['body-extended-semibold'].fontSize.value,
            lineHeight:
              designTokens.typography.typeScale.mobile['body-extended-semibold'].lineHeight.value,
            fontWeight:
              designTokens.typography.typeScale.mobile['body-extended-semibold'].fontWeight.value,
          },
        },
        subtitle2: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile['body-base-semibold'].fontSize.value} * 1.15)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile['body-base-semibold'].lineHeight.value} * 1.15)`,
            fontWeight:
              designTokens.typography.typeScale.mobile['body-base-semibold'].fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize: designTokens.typography.typeScale.mobile['body-base-semibold'].fontSize.value,
            lineHeight:
              designTokens.typography.typeScale.mobile['body-base-semibold'].lineHeight.value,
            fontWeight:
              designTokens.typography.typeScale.mobile['body-base-semibold'].fontWeight.value,
          },
        },
        body1: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile['body-extended'].fontSize.value} * 1.15)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile['body-extended'].lineHeight.value} * 1.15)`,
            fontWeight: designTokens.typography.typeScale.mobile['body-extended'].fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize: designTokens.typography.typeScale.mobile['body-extended'].fontSize.value,
            lineHeight: designTokens.typography.typeScale.mobile['body-extended'].lineHeight.value,
            fontWeight: designTokens.typography.typeScale.mobile['body-extended'].fontWeight.value,
          },
        },
        body2: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile['body-base'].fontSize.value} * 1.15)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile['body-base'].lineHeight.value} * 1.15)`,
            fontWeight: designTokens.typography.typeScale.mobile['body-base'].fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize: designTokens.typography.typeScale.mobile['body-base'].fontSize.value,
            lineHeight: designTokens.typography.typeScale.mobile['body-base'].lineHeight.value,
            fontWeight: designTokens.typography.typeScale.mobile['body-base'].fontWeight.value,
          },
        },
        caption: {
          '@media (max-width:1199px)': {
            fontSize: `calc(${designTokens.typography.typeScale.mobile.caption.fontSize.value} * 1.15)`,
            lineHeight: `calc(${designTokens.typography.typeScale.mobile.caption.lineHeight.value} * 1.15)`,
            fontWeight: designTokens.typography.typeScale.mobile.caption.fontWeight.value,
          },
          '@media (max-width:899px)': {
            fontSize: designTokens.typography.typeScale.mobile.caption.fontSize.value,
            lineHeight: designTokens.typography.typeScale.mobile.caption.lineHeight.value,
            fontWeight: designTokens.typography.typeScale.mobile.caption.fontWeight.value,
          },
        },
      },
    },
  },
  typography: {
    fontFamily: designTokens.typography.typeface.plain.value,
    h1: {
      fontSize: designTokens.typography.typeScale.desktop.headline.fontSize.value,
      lineHeight: designTokens.typography.typeScale.desktop.headline.lineHeight.value,
      fontWeight: designTokens.typography.typeScale.desktop.headline.fontWeight.value,
    },
    h2: {
      fontSize: designTokens.typography.typeScale.desktop.subtitle.fontSize.value,
      lineHeight: designTokens.typography.typeScale.desktop.subtitle.lineHeight.value,
      fontWeight: designTokens.typography.typeScale.desktop.subtitle.fontWeight.value,
    },
    h3: {
      fontSize: designTokens.typography.typeScale.desktop['heading-1'].fontSize.value,
      lineHeight: designTokens.typography.typeScale.desktop['heading-1'].lineHeight.value,
      fontWeight: designTokens.typography.typeScale.desktop['heading-1'].fontWeight.value,
    },
    h4: {
      fontSize: designTokens.typography.typeScale.desktop['heading-2'].fontSize.value,
      lineHeight: designTokens.typography.typeScale.desktop['heading-2'].lineHeight.value,
      fontWeight: designTokens.typography.typeScale.desktop['heading-2'].fontWeight.value,
    },
    h5: {
      fontSize: designTokens.typography.typeScale.desktop['heading-3'].fontSize.value,
      lineHeight: designTokens.typography.typeScale.desktop['heading-3'].lineHeight.value,
      fontWeight: designTokens.typography.typeScale.desktop['heading-3'].fontWeight.value,
    },
    h6: {
      fontSize: designTokens.typography.typeScale.desktop['heading-4'].fontSize.value,
      lineHeight: designTokens.typography.typeScale.desktop['heading-4'].lineHeight.value,
      fontWeight: designTokens.typography.typeScale.desktop['heading-4'].fontWeight.value,
    },
    subtitle1: {
      fontSize: designTokens.typography.typeScale.desktop['body-extended-semibold'].fontSize.value,
      lineHeight:
        designTokens.typography.typeScale.desktop['body-extended-semibold'].lineHeight.value,
      fontWeight:
        designTokens.typography.typeScale.desktop['body-extended-semibold'].fontWeight.value,
    },
    subtitle2: {
      fontSize: designTokens.typography.typeScale.desktop['body-base-semibold'].fontSize.value,
      lineHeight: designTokens.typography.typeScale.desktop['body-base-semibold'].lineHeight.value,
      fontWeight: designTokens.typography.typeScale.desktop['body-base-semibold'].fontWeight.value,
    },
    body1: {
      fontSize: designTokens.typography.typeScale.desktop['body-extended'].fontSize.value,
      lineHeight: designTokens.typography.typeScale.desktop['body-extended'].lineHeight.value,
      fontWeight: designTokens.typography.typeScale.desktop['body-extended'].fontWeight.value,
    },
    body2: {
      fontSize: designTokens.typography.typeScale.desktop['body-base'].fontSize.value,
      lineHeight: designTokens.typography.typeScale.desktop['body-base'].lineHeight.value,
      fontWeight: designTokens.typography.typeScale.desktop['body-base'].fontWeight.value,
    },
    caption: {
      fontSize: designTokens.typography.typeScale.desktop.caption.fontSize.value,
      lineHeight: designTokens.typography.typeScale.desktop.caption.lineHeight.value,
      fontWeight: designTokens.typography.typeScale.desktop.caption.fontWeight.value,
    },
  },
});

export default customTheme;
