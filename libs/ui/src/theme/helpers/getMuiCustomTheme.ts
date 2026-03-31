import { createTheme, type PaletteColor, type PaletteColorOptions } from '@mui/material';
import type { Theme } from '@ui/theme';
import isDarkMode from './isDarkMode';

// Extend theme options
declare module '@mui/material' {
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
}

export type GetMuiCustomThemeProps = {
  tokens: Theme;
  container?: HTMLElement | null;
};

const getMuiCustomTheme = ({ tokens, container }: GetMuiCustomThemeProps) => {
  const buttonSx = {
    height: 40, // 40px
    textTransform: 'none',
    borderRadius: tokens.shapes.borderRadiusMedium,
  } as const;

  const { colors } = tokens;

  return createTheme({
    palette: {
      mode: isDarkMode() ? 'dark' : 'light',
      primary: {
        main: colors.primary,
        contrastText: colors.onPrimary,
        dark: colors.primary,
        light: colors.background,
      },
      secondary: {
        main: colors.secondary,
        contrastText: colors.onSecondary,
        dark: colors.secondary,
        light: colors.background,
      },
      tertiary: {
        main: colors.tertiary,
        contrastText: colors.onTertiary,
        dark: colors.tertiary,
        light: colors.background,
      },
      success: {
        main: colors.success,
        contrastText: colors.onSuccess,
        dark: colors.successHover,
        light: colors.background,
      },
      warning: {
        main: colors.warning,
        contrastText: colors.onWarning,
        dark: colors.warningHover,
        light: colors.background,
      },
      error: {
        main: colors.error,
        contrastText: colors.onError,
        dark: colors.errorHover,
        light: colors.background,
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.textSecondary, // This is the default text color
        main: colors.textPrimary, // This is primary color for specific uses
        secondary: colors.textSecondary,
        tertiary: colors.textTertiary,
      },
      divider: colors.border,
      hover: {
        main: colors.primaryHover,
      },
      disabled: {
        main: colors.disabled,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            ...buttonSx,
            fontSize: tokens.typography.typeScale.desktop['body-base'].fontSize.value,
            lineHeight: tokens.typography.typeScale.desktop['body-base'].lineHeight.value,
            fontWeight: tokens.typography.weight['caption-semibold'].value,
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
            color: colors.onBackground,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.surface,
            color: colors.onSurface,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: colors.surface,
            borderRadius: tokens.shapes.borderRadiusMedium,
            backgroundClip: 'padding-box',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          sizeSmall: {
            fontSize: tokens.typography.typeScale.desktop['body-base'].fontSize.value,
            lineHeight: tokens.typography.typeScale.desktop['body-base'].lineHeight.value,
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color: colors.onSurface,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: colors.textSecondary,
            fontSize: tokens.typography.typeScale.desktop['body-base'].fontSize.value,
            lineHeight: tokens.typography.typeScale.desktop['body-base'].lineHeight.value,
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: colors.onSecondary,
            color: colors.textSecondary,
            fontSize: tokens.typography.typeScale.desktop['body-base'].fontSize.value,
            lineHeight: tokens.typography.typeScale.desktop['body-base'].lineHeight.value,
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          h1: createResponsiveTypography(tokens, 'headline', 'headline'),
          h2: createResponsiveTypography(tokens, 'subtitle', 'subtitle'),
          h3: createResponsiveTypography(tokens, 'heading-1', 'heading-1'),
          h4: createResponsiveTypography(tokens, 'heading-2', 'heading-2'),
          h5: createResponsiveTypography(tokens, 'heading-3', 'heading-3'),
          h6: createResponsiveTypography(tokens, 'heading-4', 'heading-4'),
          subtitle1: createResponsiveTypography(
            tokens,
            'body-extended-semibold',
            'body-extended-semibold'
          ),
          subtitle2: createResponsiveTypography(tokens, 'body-base-semibold', 'body-base-semibold'),
          body1: createResponsiveTypography(tokens, 'body-extended', 'body-extended'),
          body2: createResponsiveTypography(tokens, 'body-base', 'body-base'),
          caption: createResponsiveTypography(tokens, 'caption', 'caption'),
        },
      },
      // Redirect MUI portals into the shadow root when running as an embed.
      // Without this, Popper/Modal/Popover render into document.body, which is
      // outside the shadow root, and therefore miss all Emotion-injected styles.
      ...(container && {
        MuiPopper: {
          defaultProps: { container },
        },
        MuiModal: {
          defaultProps: { container },
        },
        MuiPopover: {
          defaultProps: { container },
        },
      }),
    },
    typography: {
      fontFamily: tokens.typography.typeface.plain.value,
      h1: {
        fontSize: tokens.typography.typeScale.desktop.headline.fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop.headline.lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop.headline.fontWeight.value,
      },
      h2: {
        fontSize: tokens.typography.typeScale.desktop.subtitle.fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop.subtitle.lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop.subtitle.fontWeight.value,
      },
      h3: {
        fontSize: tokens.typography.typeScale.desktop['heading-1'].fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop['heading-1'].lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop['heading-1'].fontWeight.value,
      },
      h4: {
        fontSize: tokens.typography.typeScale.desktop['heading-2'].fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop['heading-2'].lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop['heading-2'].fontWeight.value,
      },
      h5: {
        fontSize: tokens.typography.typeScale.desktop['heading-3'].fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop['heading-3'].lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop['heading-3'].fontWeight.value,
      },
      h6: {
        fontSize: tokens.typography.typeScale.desktop['heading-4'].fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop['heading-4'].lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop['heading-4'].fontWeight.value,
      },
      subtitle1: {
        fontSize: tokens.typography.typeScale.desktop['body-extended-semibold'].fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop['body-extended-semibold'].lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop['body-extended-semibold'].fontWeight.value,
      },
      subtitle2: {
        fontSize: tokens.typography.typeScale.desktop['body-base-semibold'].fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop['body-base-semibold'].lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop['body-base-semibold'].fontWeight.value,
      },
      body1: {
        fontSize: tokens.typography.typeScale.desktop['body-extended'].fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop['body-extended'].lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop['body-extended'].fontWeight.value,
      },
      body2: {
        fontSize: tokens.typography.typeScale.desktop['body-base'].fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop['body-base'].lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop['body-base'].fontWeight.value,
      },
      caption: {
        fontSize: tokens.typography.typeScale.desktop.caption.fontSize.value,
        lineHeight: tokens.typography.typeScale.desktop.caption.lineHeight.value,
        fontWeight: tokens.typography.typeScale.desktop.caption.fontWeight.value,
      },
    },
  });
};

// Helper function to generate responsive typography
function createResponsiveTypography(
  tokens: Theme,
  desktopVariant: keyof typeof tokens.typography.typeScale.desktop,
  mobileVariant: keyof typeof tokens.typography.typeScale.mobile
) {
  return {
    '@media (max-width:1199px)': {
      fontSize: `calc(${tokens.typography.typeScale.mobile[mobileVariant].fontSize.value} * ${desktopVariant === 'headline' ? 1.5 : 1.15})`,
      lineHeight: `calc(${tokens.typography.typeScale.mobile[mobileVariant].lineHeight.value} * ${desktopVariant === 'headline' ? 1.5 : 1.15})`,
      fontWeight: tokens.typography.typeScale.mobile[mobileVariant].fontWeight.value,
    },
    '@media (max-width:899px)': {
      fontSize: tokens.typography.typeScale.mobile[mobileVariant].fontSize.value,
      lineHeight: tokens.typography.typeScale.mobile[mobileVariant].lineHeight.value,
      fontWeight: tokens.typography.typeScale.mobile[mobileVariant].fontWeight.value,
    },
  };
}

export default getMuiCustomTheme;
