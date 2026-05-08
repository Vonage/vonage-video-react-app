export type VeraTypographyTokenKey =
  | 'headline'
  | 'subtitle'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'heading-4'
  | 'body-extended'
  | 'body-extended-semibold'
  | 'body-base'
  | 'body-base-semibold'
  | 'caption'
  | 'caption-semibold';

type VeraTypographyPropertyKey =
  | 'font-size'
  | 'line-height'
  | 'font-weight'
  | 'mobile-font-size'
  | 'mobile-line-height'
  | 'mobile-font-weight';

export type VeraTypographyCssVariable =
  `--vera-typography-${VeraTypographyTokenKey}-${VeraTypographyPropertyKey}`;

export type VeraTypographyVariableNamesByToken = {
  fontSize: VeraTypographyCssVariable;
  lineHeight: VeraTypographyCssVariable;
  fontWeight: VeraTypographyCssVariable;
};

export const veraTypographyCssVariableNames: Record<
  VeraTypographyTokenKey,
  VeraTypographyVariableNamesByToken
> = {
  headline: {
    fontSize: '--vera-typography-headline-font-size',
    lineHeight: '--vera-typography-headline-line-height',
    fontWeight: '--vera-typography-headline-font-weight',
  },
  subtitle: {
    fontSize: '--vera-typography-subtitle-font-size',
    lineHeight: '--vera-typography-subtitle-line-height',
    fontWeight: '--vera-typography-subtitle-font-weight',
  },
  'heading-1': {
    fontSize: '--vera-typography-heading-1-font-size',
    lineHeight: '--vera-typography-heading-1-line-height',
    fontWeight: '--vera-typography-heading-1-font-weight',
  },
  'heading-2': {
    fontSize: '--vera-typography-heading-2-font-size',
    lineHeight: '--vera-typography-heading-2-line-height',
    fontWeight: '--vera-typography-heading-2-font-weight',
  },
  'heading-3': {
    fontSize: '--vera-typography-heading-3-font-size',
    lineHeight: '--vera-typography-heading-3-line-height',
    fontWeight: '--vera-typography-heading-3-font-weight',
  },
  'heading-4': {
    fontSize: '--vera-typography-heading-4-font-size',
    lineHeight: '--vera-typography-heading-4-line-height',
    fontWeight: '--vera-typography-heading-4-font-weight',
  },
  'body-extended': {
    fontSize: '--vera-typography-body-extended-font-size',
    lineHeight: '--vera-typography-body-extended-line-height',
    fontWeight: '--vera-typography-body-extended-font-weight',
  },
  'body-extended-semibold': {
    fontSize: '--vera-typography-body-extended-semibold-font-size',
    lineHeight: '--vera-typography-body-extended-semibold-line-height',
    fontWeight: '--vera-typography-body-extended-semibold-font-weight',
  },
  'body-base': {
    fontSize: '--vera-typography-body-base-font-size',
    lineHeight: '--vera-typography-body-base-line-height',
    fontWeight: '--vera-typography-body-base-font-weight',
  },
  'body-base-semibold': {
    fontSize: '--vera-typography-body-base-semibold-font-size',
    lineHeight: '--vera-typography-body-base-semibold-line-height',
    fontWeight: '--vera-typography-body-base-semibold-font-weight',
  },
  caption: {
    fontSize: '--vera-typography-caption-font-size',
    lineHeight: '--vera-typography-caption-line-height',
    fontWeight: '--vera-typography-caption-font-weight',
  },
  'caption-semibold': {
    fontSize: '--vera-typography-caption-semibold-font-size',
    lineHeight: '--vera-typography-caption-semibold-line-height',
    fontWeight: '--vera-typography-caption-semibold-font-weight',
  },
};

export type VeraLayoutCssVariable =
  | '--vera-border-radius-none'
  | '--vera-border-radius-extra-small'
  | '--vera-border-radius-small'
  | '--vera-border-radius-medium'
  | '--vera-border-radius-large'
  | '--vera-border-radius-extra-large';
export type VeraFontCssVariable = '--vera-font-family-plain';

export type VeraColorCssVariable =
  | '--vera-primary'
  | '--vera-on-primary'
  | '--vera-primary-dark'
  | '--vera-primary-light'
  | '--vera-primary-hover'
  | '--vera-secondary'
  | '--vera-on-secondary'
  | '--vera-secondary-dark'
  | '--vera-secondary-light'
  | '--vera-tertiary'
  | '--vera-on-tertiary'
  | '--vera-tertiary-dark'
  | '--vera-tertiary-light'
  | '--vera-success'
  | '--vera-on-success'
  | '--vera-success-hover'
  | '--vera-success-light'
  | '--vera-warning'
  | '--vera-on-warning'
  | '--vera-warning-hover'
  | '--vera-warning-light'
  | '--vera-error'
  | '--vera-on-error'
  | '--vera-error-hover'
  | '--vera-error-light'
  | '--vera-background'
  | '--vera-surface'
  | '--vera-on-surface'
  | '--vera-on-background'
  | '--vera-text-primary'
  | '--vera-text-secondary'
  | '--vera-text-tertiary'
  | '--vera-border'
  | '--vera-disabled';

export type VeraCssVariable =
  | VeraLayoutCssVariable
  | VeraFontCssVariable
  | VeraColorCssVariable
  | VeraTypographyCssVariable;

type VeraTypographyProperties = Partial<{
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  mobileFontSize: string;
  mobileLineHeight: string;
  mobileFontWeight: string;
}>;

type VeraColorProperties = Partial<{
  accent: string;
  alertBackground: string;
  alertBackgroundHover: string;
  alertText: string;
  background: string;
  border: string;
  darkBackground: string;
  darkGrey: string;
  darkGreyHover: string;
  darkGreyOpacity: string;
  disabled: string;
  error: string;
  errorHover: string;
  information: string;
  informationBackground: string;
  informationHover: string;
  onAccent: string;
  onBackground: string;
  onDarkGrey: string;
  onError: string;
  onInformation: string;
  onPrimary: string;
  onSecondary: string;
  onSuccess: string;
  onSurface: string;
  onTertiary: string;
  onWarning: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  skeletonLike: string;
  success: string;
  successHover: string;
  surface: string;
  tertiary: string;
  tertiaryHover: string;
  textDisabled: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  warning: string;
  warningHover: string;
}>;

/**
 * Configuration for the veraUI Tailwind plugin.
 * Allows overriding design tokens for colors, typography, border radius, and font family.
 * All tokens are optional and will fall back to design system defaults.
 *
 * @example
 * // Using default values
 * plugins: [veraUI()]
 *
 * @example
 * // Overriding specific tokens
 * plugins: [veraUI({
 *   light: { primary: '#FF5733', accent: '#00FF00' },
 *   dark: { primary: '#AA2211', accent: '#00AA00' },
 *   borderRadiusMedium: '12px',
 *   headline: { fontSize: '5rem' },
 * })]
 */
export type VeraUIConfig = {
  light?: VeraColorProperties;
  dark?: VeraColorProperties;
  borderRadiusNone?: string;
  borderRadiusExtraSmall?: string;
  borderRadiusSmall?: string;
  borderRadiusMedium?: string;
  borderRadiusLarge?: string;
  borderRadiusExtraLarge?: string;
  fontFamilyPlain?: string;
  headline?: VeraTypographyProperties;
  subtitle?: VeraTypographyProperties;
  heading1?: VeraTypographyProperties;
  heading2?: VeraTypographyProperties;
  heading3?: VeraTypographyProperties;
  heading4?: VeraTypographyProperties;
  bodyExtended?: VeraTypographyProperties;
  bodyExtendedSemibold?: VeraTypographyProperties;
  bodyBase?: VeraTypographyProperties;
  bodyBaseSemibold?: VeraTypographyProperties;
  caption?: VeraTypographyProperties;
  captionSemibold?: VeraTypographyProperties;
};
