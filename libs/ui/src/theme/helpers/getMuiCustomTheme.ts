import { createTheme, Theme } from '@mui/material/styles';
import {
  veraTypographyCssVariableNames,
  type VeraCssVariable,
  type VeraTypographyTokenKey,
} from './veraUI.types';

export type GetMuiCustomThemeProps = {
  container?: HTMLElement | null;
};

const temporaryTypographyVariables = getTemporaryTypographyVariables();

const getMuiCustomTheme = ({ container }: GetMuiCustomThemeProps = {}): Theme => {
  const getCssVariable = (name: VeraCssVariable): string => {
    return `var(${name})`;
  };

  const getTemporaryTypography = (
    variant: keyof ReturnType<typeof getTemporaryTypographyVariables>
  ) => {
    const variableNames = temporaryTypographyVariables[variant].desktop;

    return {
      fontSize: getCssVariable(variableNames.fontSize),
      lineHeight: getCssVariable(variableNames.lineHeight),
      fontWeight: getCssVariable(variableNames.fontWeight),
    };
  };

  const buttonSx = {
    height: 40, // 40px
    textTransform: 'none',
    borderRadius: getCssVariable('--vera-border-radius-medium'),
  } as const;

  const cssVariables = container
    ? {
        rootSelector: ':host',
        colorSchemeSelector: 'class',
      }
    : true;

  return createTheme({
    cssVariables,
    palette: {
      primary: {
        main: getCssVariable('--vera-primary'),
        contrastText: getCssVariable('--vera-on-primary'),
        dark: getCssVariable('--vera-primary-dark'),
        light: getCssVariable('--vera-primary-light'),
      },
      secondary: {
        main: getCssVariable('--vera-secondary'),
        contrastText: getCssVariable('--vera-on-secondary'),
        dark: getCssVariable('--vera-secondary-dark'),
        light: getCssVariable('--vera-secondary-light'),
      },
      tertiary: {
        main: getCssVariable('--vera-tertiary'),
        contrastText: getCssVariable('--vera-on-tertiary'),
        dark: getCssVariable('--vera-tertiary-dark'),
        light: getCssVariable('--vera-tertiary-light'),
      },
      success: {
        main: getCssVariable('--vera-success'),
        contrastText: getCssVariable('--vera-on-success'),
        dark: getCssVariable('--vera-success-hover'),
        light: getCssVariable('--vera-success-light'),
      },
      warning: {
        main: getCssVariable('--vera-warning'),
        contrastText: getCssVariable('--vera-on-warning'),
        dark: getCssVariable('--vera-warning-hover'),
        light: getCssVariable('--vera-warning-light'),
      },
      error: {
        main: getCssVariable('--vera-error'),
        contrastText: getCssVariable('--vera-on-error'),
        dark: getCssVariable('--vera-error-hover'),
        light: getCssVariable('--vera-error-light'),
      },
      background: {
        default: getCssVariable('--vera-background'),
        paper: getCssVariable('--vera-surface'),
      },
      text: {
        primary: getCssVariable('--vera-text-secondary'),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        main: getCssVariable('--vera-text-primary'),
        secondary: getCssVariable('--vera-text-secondary'),
        tertiary: getCssVariable('--vera-text-tertiary'),
      },
      divider: getCssVariable('--vera-border'),
      hover: {
        main: getCssVariable('--vera-primary-hover'),
      },
      disabled: {
        main: getCssVariable('--vera-disabled'),
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            borderColor: getCssVariable('--vera-border'),
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            ...buttonSx,
            fontSize: getCssVariable('--vera-typography-body-base-font-size'),
            lineHeight: getCssVariable('--vera-typography-body-base-line-height'),
            fontWeight: getCssVariable('--vera-typography-caption-semibold-font-weight'),
          },
          outlined: {
            borderColor: getCssVariable('--vera-primary'),
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
            backgroundColor: getCssVariable('--vera-surface'),
            color: getCssVariable('--vera-on-surface'),
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: getCssVariable('--vera-background'),
            color: getCssVariable('--vera-on-background'),
          },
        },
      },
      MuiDialog: {
        defaultProps: {
          slotProps: {
            paper: {
              className: 'dark:border dark:border-vera-border',
            },
          },
        },
        styleOverrides: {
          paper: {
            backgroundColor: getCssVariable('--vera-surface'),
            color: getCssVariable('--vera-on-surface'),
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: getCssVariable('--vera-surface'),
            borderRadius: getCssVariable('--vera-border-radius-medium'),
            backgroundClip: 'padding-box',
          },
          notchedOutline: {
            borderColor: getCssVariable('--vera-border'),
          },
          input: {
            // backward compatibility after migrating to mui9
            '&:-webkit-autofill': {
              WebkitBoxShadow: 'unset',
              WebkitTextFillColor: 'unset',
              caretColor: 'unset',
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          sizeSmall: {
            fontSize: getCssVariable('--vera-typography-body-base-font-size'),
            lineHeight: getCssVariable('--vera-typography-body-base-line-height'),
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color: getCssVariable('--vera-on-surface'),
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: getCssVariable('--vera-text-secondary'),
            fontSize: getCssVariable('--vera-typography-body-base-font-size'),
            lineHeight: getCssVariable('--vera-typography-body-base-line-height'),
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: getCssVariable('--vera-on-secondary'),
            color: getCssVariable('--vera-text-secondary'),
            fontSize: getCssVariable('--vera-typography-body-base-font-size'),
            lineHeight: getCssVariable('--vera-typography-body-base-line-height'),
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
      fontFamily: getCssVariable('--vera-font-family-plain'),
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
  type TypographyTokenKeyForTheme = Exclude<VeraTypographyTokenKey, 'caption-semibold'>;

  function createTypographyVariablesByToken(tokenKey: TypographyTokenKeyForTheme) {
    return {
      desktop: {
        fontSize: veraTypographyCssVariableNames[tokenKey].fontSize,
        lineHeight: veraTypographyCssVariableNames[tokenKey].lineHeight,
        fontWeight: veraTypographyCssVariableNames[tokenKey].fontWeight,
      },
      mobile: {
        fontSize: `--vera-typography-${tokenKey}-mobile-font-size` as VeraCssVariable,
        lineHeight: `--vera-typography-${tokenKey}-mobile-line-height` as VeraCssVariable,
        fontWeight: `--vera-typography-${tokenKey}-mobile-font-weight` as VeraCssVariable,
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
  const mobileVariableNames = variableKey.mobile;
  const isHeadline = variant === 'headline';
  const tabletScale = isHeadline ? 1.5 : 1.15;

  return {
    '@media (max-width:1199px)': {
      fontSize: `calc(var(${mobileVariableNames.fontSize}) * ${tabletScale})`,
      lineHeight: `calc(var(${mobileVariableNames.lineHeight}) * ${tabletScale})`,
      fontWeight: `var(${mobileVariableNames.fontWeight})`,
    },
    '@media (max-width:899px)': {
      fontSize: `var(${mobileVariableNames.fontSize})`,
      lineHeight: `var(${mobileVariableNames.lineHeight})`,
      fontWeight: `var(${mobileVariableNames.fontWeight})`,
    },
  };
}

export default getMuiCustomTheme;
