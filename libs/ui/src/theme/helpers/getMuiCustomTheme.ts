import { createTheme } from '@mui/material/styles';
import designTokens from './designTokens/designTokens.json';
import {
  veraTypographyCssVariableNames,
  type VeraCssVariable,
  type VeraTypographyTokenKey,
} from './veraUI.types';

export type GetMuiCustomThemeProps = {
  container?: HTMLElement | null;
};

const temporaryTypographyVariables = getTemporaryTypographyVariables();

const getMuiCustomTheme = ({ container }: GetMuiCustomThemeProps = {}) => {
  const lightColors = designTokens.colors.light;
  const desktopFontSize = designTokens.fontSize.desktop;
  const bodyBaseDesktopTypography = desktopFontSize['body-base'];
  const captionSemiboldDesktopTypography = desktopFontSize['caption-semibold'];
  const mediumBorderRadius = designTokens.borderRadius.medium;
  const plainFontFamily = designTokens.fontFamily.plain;
  const mediumBorderRadiusVariableName = '--vera-border-radius-medium' as const;
  const plainFontFamilyVariableName = '--vera-font-family-plain' as const;
  const bodyBaseDesktopFontSizeVariableName = '--vera-typography-body-base-font-size' as const;
  const bodyBaseDesktopLineHeightVariableName = '--vera-typography-body-base-line-height' as const;
  const captionSemiboldDesktopFontWeightVariableName =
    '--vera-typography-caption-semibold-font-weight' as const;

  const getCssVariable = (name: VeraCssVariable, fallbackValue: string): string => {
    return `var(${name}, ${fallbackValue})`;
  };

  const getTemporaryTypography = (
    variant: keyof ReturnType<typeof getTemporaryTypographyVariables>
  ) => {
    const variableKey = temporaryTypographyVariables[variant];
    const desktopTypography = variableKey.desktop;

    return {
      fontSize: getCssVariable(
        desktopTypography.fontSize.name,
        desktopTypography.fontSize.fallback
      ),
      lineHeight: getCssVariable(
        desktopTypography.lineHeight.name,
        desktopTypography.lineHeight.fallback
      ),
      fontWeight: getCssVariable(
        desktopTypography.fontWeight.name,
        desktopTypography.fontWeight.fallback
      ),
    };
  };

  const buttonSx = {
    height: 40, // 40px
    textTransform: 'none',
    borderRadius: getCssVariable(mediumBorderRadiusVariableName, mediumBorderRadius),
  } as const;

  return createTheme({
    cssVariables: {
      rootSelector: ':host',
      colorSchemeSelector: ':host(.%s)',
    },
    palette: {
      primary: {
        main: getCssVariable('--vera-primary', lightColors.primary),
        contrastText: getCssVariable('--vera-on-primary', lightColors['on-primary']),
        dark: getCssVariable('--vera-primary-dark', designTokens.colors.dark.primary),
        light: getCssVariable('--vera-primary-light', lightColors.primary),
      },
      secondary: {
        main: getCssVariable('--vera-secondary', lightColors.secondary),
        contrastText: getCssVariable('--vera-on-secondary', lightColors['on-secondary']),
        dark: getCssVariable('--vera-secondary-dark', designTokens.colors.dark.secondary),
        light: getCssVariable('--vera-secondary-light', lightColors.secondary),
      },
      tertiary: {
        main: getCssVariable('--vera-tertiary', lightColors.tertiary),
        contrastText: getCssVariable('--vera-on-tertiary', lightColors['on-tertiary']),
        dark: getCssVariable('--vera-tertiary-dark', designTokens.colors.dark.tertiary),
        light: getCssVariable('--vera-tertiary-light', lightColors.tertiary),
      },
      success: {
        main: getCssVariable('--vera-success', lightColors.success),
        contrastText: getCssVariable('--vera-on-success', lightColors['on-success']),
        dark: getCssVariable('--vera-success-hover', lightColors['success-hover']),
        light: getCssVariable('--vera-success-light', lightColors.success),
      },
      warning: {
        main: getCssVariable('--vera-warning', lightColors.warning),
        contrastText: getCssVariable('--vera-on-warning', lightColors['on-warning']),
        dark: getCssVariable('--vera-warning-hover', lightColors['warning-hover']),
        light: getCssVariable('--vera-warning-light', lightColors.warning),
      },
      error: {
        main: getCssVariable('--vera-error', lightColors.error),
        contrastText: getCssVariable('--vera-on-error', lightColors['on-error']),
        dark: getCssVariable('--vera-error-hover', lightColors['error-hover']),
        light: getCssVariable('--vera-error-light', lightColors.error),
      },
      background: {
        default: getCssVariable('--vera-background', lightColors.background),
        paper: getCssVariable('--vera-surface', lightColors.surface),
      },
      text: {
        primary: getCssVariable('--vera-text-secondary', lightColors['text-secondary']),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        main: getCssVariable('--vera-text-primary', lightColors['text-primary']),
        secondary: getCssVariable('--vera-text-secondary', lightColors['text-secondary']),
        tertiary: getCssVariable('--vera-text-tertiary', lightColors['text-tertiary']),
      },
      divider: getCssVariable('--vera-border', lightColors.border),
      hover: {
        main: getCssVariable('--vera-primary-hover', lightColors['primary-hover']),
      },
      disabled: {
        main: getCssVariable('--vera-disabled', lightColors.disabled),
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            ...buttonSx,
            fontSize: getCssVariable(
              bodyBaseDesktopFontSizeVariableName,
              bodyBaseDesktopTypography.fontSize
            ),
            lineHeight: getCssVariable(
              bodyBaseDesktopLineHeightVariableName,
              bodyBaseDesktopTypography.lineHeight
            ),
            fontWeight: getCssVariable(
              captionSemiboldDesktopFontWeightVariableName,
              captionSemiboldDesktopTypography.fontWeight
            ),
          },
          outlined: {
            borderColor: getCssVariable('--vera-primary', lightColors.primary),
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
            backgroundColor: getCssVariable('--vera-surface', lightColors.surface),
            color: getCssVariable('--vera-on-surface', lightColors['on-surface']),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: getCssVariable('--vera-background', lightColors.background),
            color: getCssVariable('--vera-on-background', lightColors['on-background']),
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: getCssVariable('--vera-surface', lightColors.surface),
            color: getCssVariable('--vera-on-surface', lightColors['on-surface']),
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: getCssVariable('--vera-surface', lightColors.surface),
            borderRadius: getCssVariable(mediumBorderRadiusVariableName, mediumBorderRadius),
            backgroundClip: 'padding-box',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          sizeSmall: {
            fontSize: getCssVariable(
              bodyBaseDesktopFontSizeVariableName,
              bodyBaseDesktopTypography.fontSize
            ),
            lineHeight: getCssVariable(
              bodyBaseDesktopLineHeightVariableName,
              bodyBaseDesktopTypography.lineHeight
            ),
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color: getCssVariable('--vera-on-surface', lightColors['on-surface']),
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: getCssVariable('--vera-text-secondary', lightColors['text-secondary']),
            fontSize: getCssVariable(
              bodyBaseDesktopFontSizeVariableName,
              bodyBaseDesktopTypography.fontSize
            ),
            lineHeight: getCssVariable(
              bodyBaseDesktopLineHeightVariableName,
              bodyBaseDesktopTypography.lineHeight
            ),
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: getCssVariable('--vera-on-secondary', lightColors['on-secondary']),
            color: getCssVariable('--vera-text-secondary', lightColors['text-secondary']),
            fontSize: getCssVariable(
              bodyBaseDesktopFontSizeVariableName,
              bodyBaseDesktopTypography.fontSize
            ),
            lineHeight: getCssVariable(
              bodyBaseDesktopLineHeightVariableName,
              bodyBaseDesktopTypography.lineHeight
            ),
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          h1: createResponsiveTypography('headline'),
          h2: createResponsiveTypography('subtitle'),
          h3: createResponsiveTypography('heading-1'),
          h4: createResponsiveTypography('heading-2'),
          h5: createResponsiveTypography('heading-3'),
          h6: createResponsiveTypography('heading-4'),
          subtitle1: createResponsiveTypography('body-extended-semibold'),
          subtitle2: createResponsiveTypography('body-base-semibold'),
          body1: createResponsiveTypography('body-extended'),
          body2: createResponsiveTypography('body-base'),
          caption: createResponsiveTypography('caption'),
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
      fontFamily: getCssVariable(plainFontFamilyVariableName, plainFontFamily),
      h1: getTemporaryTypography('headline'),
      h2: getTemporaryTypography('subtitle'),
      h3: getTemporaryTypography('heading-1'),
      h4: getTemporaryTypography('heading-2'),
      h5: getTemporaryTypography('heading-3'),
      h6: getTemporaryTypography('heading-4'),
      subtitle1: getTemporaryTypography('body-extended-semibold'),
      subtitle2: getTemporaryTypography('body-base-semibold'),
      body1: getTemporaryTypography('body-extended'),
      body2: getTemporaryTypography('body-base'),
      caption: getTemporaryTypography('caption'),
    },
  });
};

function getTemporaryTypographyVariables() {
  const desktop = designTokens.fontSize.desktop;
  const mobile = designTokens.fontSize.mobile;

  // Typography temporary vars are defined here because there are many of them.
  // Non-typography adapter vars are consumed directly in the MUI theme object.
  // Only desktop typography uses temporary CSS vars. Mobile responsive values
  // stay static, matching the previous MUI token-based behavior.
  // Desktop temporary MUI typography variable naming follows:
  // --vera-typography-{variant}-font-{property}

  type TypographyTokenKeyForTheme = Exclude<VeraTypographyTokenKey, 'caption-semibold'>;

  function createTypographyVariablesByToken(tokenKey: TypographyTokenKeyForTheme) {
    const desktopTypography = desktop[tokenKey];
    const mobileTypography = mobile[tokenKey];

    return {
      desktop: {
        fontSize: {
          name: veraTypographyCssVariableNames[tokenKey].fontSize,
          fallback: desktopTypography.fontSize,
        },
        lineHeight: {
          name: veraTypographyCssVariableNames[tokenKey].lineHeight,
          fallback: desktopTypography.lineHeight,
        },
        fontWeight: {
          name: veraTypographyCssVariableNames[tokenKey].fontWeight,
          fallback: desktopTypography.fontWeight,
        },
      },
      mobile: {
        fontSize: mobileTypography.fontSize,
        lineHeight: mobileTypography.lineHeight,
        fontWeight: mobileTypography.fontWeight,
      },
    };
  }

  return {
    headline: createTypographyVariablesByToken('headline'),
    subtitle: createTypographyVariablesByToken('subtitle'),
    'heading-1': createTypographyVariablesByToken('heading-1'),
    'heading-2': createTypographyVariablesByToken('heading-2'),
    'heading-3': createTypographyVariablesByToken('heading-3'),
    'heading-4': createTypographyVariablesByToken('heading-4'),
    'body-extended': createTypographyVariablesByToken('body-extended'),
    'body-extended-semibold': createTypographyVariablesByToken('body-extended-semibold'),
    'body-base': createTypographyVariablesByToken('body-base'),
    'body-base-semibold': createTypographyVariablesByToken('body-base-semibold'),
    caption: createTypographyVariablesByToken('caption'),
  } as const;
}

function createResponsiveTypography(
  variant: keyof ReturnType<typeof getTemporaryTypographyVariables>
) {
  const variableKey = temporaryTypographyVariables[variant];
  const mobileTypography = variableKey.mobile;
  const isHeadline = variant === 'headline';
  const tabletScale = isHeadline ? 1.5 : 1.15;

  return {
    '@media (max-width:1199px)': {
      fontSize: `calc(${mobileTypography.fontSize} * ${tabletScale})`,
      lineHeight: `calc(${mobileTypography.lineHeight} * ${tabletScale})`,
      fontWeight: mobileTypography.fontWeight,
    },
    '@media (max-width:899px)': {
      fontSize: mobileTypography.fontSize,
      lineHeight: mobileTypography.lineHeight,
      fontWeight: mobileTypography.fontWeight,
    },
  };
}

export default getMuiCustomTheme;
