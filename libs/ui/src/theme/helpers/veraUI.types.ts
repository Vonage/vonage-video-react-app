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

type VeraTypographyPropertyKey = 'font-size' | 'line-height' | 'font-weight';

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

export type VeraLayoutCssVariable = '--vera-border-radius-medium';
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
