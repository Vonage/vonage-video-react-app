import colorTokens from '@ui/theme/helpers/designTokens/tokens/color';
import borderTokens from '@ui/theme/helpers/designTokens/tokens/border';
import typographyTokens from '@ui/theme/helpers/designTokens/tokens/typography';
import typefaceTokens from '@ui/theme/helpers/designTokens/tokens/typography/typeface';
import type { VeraUIConfig } from '@ui/theme/helpers/veraUI.types';

type ThemeMode = 'light' | 'dark';

export type ColorTokenMetadata = {
  tokenKey: string;
  configKey: string;
  description: string;
};

export type TypographyTokenMetadata = {
  tokenKey: string;
  configKey: keyof VeraUIConfig;
  fontSizeDescription: string;
  lineHeightDescription: string;
  fontWeightDescription: string;
};

export type BorderTokenMetadata = {
  tokenKey: string;
  configKey: keyof VeraUIConfig;
  description: string;
};

const kebabToCamelCase = (value: string): string =>
  value.replace(/-([a-z0-9])/g, (_match, character: string) => character.toUpperCase());

const typographyConfigKeyByToken: Record<string, keyof VeraUIConfig> = {
  headline: 'headline',
  subtitle: 'subtitle',
  'heading-1': 'heading1',
  'heading-2': 'heading2',
  'heading-3': 'heading3',
  'heading-4': 'heading4',
  'body-extended': 'bodyExtended',
  'body-extended-semibold': 'bodyExtendedSemibold',
  'body-base': 'bodyBase',
  'body-base-semibold': 'bodyBaseSemibold',
  caption: 'caption',
  'caption-semibold': 'captionSemibold',
};

const borderConfigKeyByToken: Record<string, keyof VeraUIConfig> = {
  none: 'borderRadiusNone',
  'extra-small': 'borderRadiusExtraSmall',
  small: 'borderRadiusSmall',
  medium: 'borderRadiusMedium',
  large: 'borderRadiusLarge',
  'extra-large': 'borderRadiusExtraLarge',
};

export const colorTokenMetadata: ColorTokenMetadata[] = Object.entries(colorTokens.light).map(
  ([tokenKey, token]) => ({
    tokenKey,
    configKey: kebabToCamelCase(tokenKey),
    description: token.description,
  })
);

export const typographyTokenMetadata: TypographyTokenMetadata[] = Object.entries(
  typographyTokens.typeScale.desktop
).map(([tokenKey, desktopToken]) => ({
  tokenKey,
  configKey: typographyConfigKeyByToken[tokenKey],
  fontSizeDescription: desktopToken.fontSize.description,
  lineHeightDescription: desktopToken.lineHeight.description,
  fontWeightDescription: desktopToken.fontWeight.description,
}));

export const borderTokenMetadata: BorderTokenMetadata[] = Object.entries(borderTokens).map(
  ([tokenKey, token]) => ({
    tokenKey,
    configKey: borderConfigKeyByToken[tokenKey],
    description: token.description,
  })
);

export const fontFamilyDescription = typefaceTokens.plain.description;

const extractColorDefaultsByTheme = (themeMode: ThemeMode): Record<string, string> =>
  Object.fromEntries(
    Object.entries(colorTokens[themeMode]).map(([tokenKey, token]) => [
      kebabToCamelCase(tokenKey),
      token.value,
    ])
  );

export const defaultDesignTokens: VeraUIConfig = {
  light: extractColorDefaultsByTheme('light'),
  dark: extractColorDefaultsByTheme('dark'),
  borderRadiusNone: borderTokens.none.value,
  borderRadiusExtraSmall: borderTokens['extra-small'].value,
  borderRadiusSmall: borderTokens.small.value,
  borderRadiusMedium: borderTokens.medium.value,
  borderRadiusLarge: borderTokens.large.value,
  borderRadiusExtraLarge: borderTokens['extra-large'].value,
  fontFamilyPlain: typefaceTokens.plain.value,
  headline: {
    fontSize: typographyTokens.typeScale.desktop.headline.fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop.headline.lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop.headline.fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile.headline.fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile.headline.lineHeight.value,
    mobileFontWeight: String(typographyTokens.typeScale.mobile.headline.fontWeight.value),
  },
  subtitle: {
    fontSize: typographyTokens.typeScale.desktop.subtitle.fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop.subtitle.lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop.subtitle.fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile.subtitle.fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile.subtitle.lineHeight.value,
    mobileFontWeight: String(typographyTokens.typeScale.mobile.subtitle.fontWeight.value),
  },
  heading1: {
    fontSize: typographyTokens.typeScale.desktop['heading-1'].fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop['heading-1'].lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop['heading-1'].fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile['heading-1'].fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile['heading-1'].lineHeight.value,
    mobileFontWeight: String(typographyTokens.typeScale.mobile['heading-1'].fontWeight.value),
  },
  heading2: {
    fontSize: typographyTokens.typeScale.desktop['heading-2'].fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop['heading-2'].lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop['heading-2'].fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile['heading-2'].fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile['heading-2'].lineHeight.value,
    mobileFontWeight: String(typographyTokens.typeScale.mobile['heading-2'].fontWeight.value),
  },
  heading3: {
    fontSize: typographyTokens.typeScale.desktop['heading-3'].fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop['heading-3'].lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop['heading-3'].fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile['heading-3'].fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile['heading-3'].lineHeight.value,
    mobileFontWeight: String(typographyTokens.typeScale.mobile['heading-3'].fontWeight.value),
  },
  heading4: {
    fontSize: typographyTokens.typeScale.desktop['heading-4'].fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop['heading-4'].lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop['heading-4'].fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile['heading-4'].fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile['heading-4'].lineHeight.value,
    mobileFontWeight: String(typographyTokens.typeScale.mobile['heading-4'].fontWeight.value),
  },
  bodyExtended: {
    fontSize: typographyTokens.typeScale.desktop['body-extended'].fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop['body-extended'].lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop['body-extended'].fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile['body-extended'].fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile['body-extended'].lineHeight.value,
    mobileFontWeight: String(typographyTokens.typeScale.mobile['body-extended'].fontWeight.value),
  },
  bodyExtendedSemibold: {
    fontSize: typographyTokens.typeScale.desktop['body-extended-semibold'].fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop['body-extended-semibold'].lineHeight.value,
    fontWeight: String(
      typographyTokens.typeScale.desktop['body-extended-semibold'].fontWeight.value
    ),
    mobileFontSize: typographyTokens.typeScale.mobile['body-extended-semibold'].fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile['body-extended-semibold'].lineHeight.value,
    mobileFontWeight: String(
      typographyTokens.typeScale.mobile['body-extended-semibold'].fontWeight.value
    ),
  },
  bodyBase: {
    fontSize: typographyTokens.typeScale.desktop['body-base'].fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop['body-base'].lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop['body-base'].fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile['body-base'].fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile['body-base'].lineHeight.value,
    mobileFontWeight: String(typographyTokens.typeScale.mobile['body-base'].fontWeight.value),
  },
  bodyBaseSemibold: {
    fontSize: typographyTokens.typeScale.desktop['body-base-semibold'].fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop['body-base-semibold'].lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop['body-base-semibold'].fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile['body-base-semibold'].fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile['body-base-semibold'].lineHeight.value,
    mobileFontWeight: String(
      typographyTokens.typeScale.mobile['body-base-semibold'].fontWeight.value
    ),
  },
  caption: {
    fontSize: typographyTokens.typeScale.desktop.caption.fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop.caption.lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop.caption.fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile.caption.fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile.caption.lineHeight.value,
    mobileFontWeight: String(typographyTokens.typeScale.mobile.caption.fontWeight.value),
  },
  captionSemibold: {
    fontSize: typographyTokens.typeScale.desktop['caption-semibold'].fontSize.value,
    lineHeight: typographyTokens.typeScale.desktop['caption-semibold'].lineHeight.value,
    fontWeight: String(typographyTokens.typeScale.desktop['caption-semibold'].fontWeight.value),
    mobileFontSize: typographyTokens.typeScale.mobile['caption-semibold'].fontSize.value,
    mobileLineHeight: typographyTokens.typeScale.mobile['caption-semibold'].lineHeight.value,
    mobileFontWeight: String(
      typographyTokens.typeScale.mobile['caption-semibold'].fontWeight.value
    ),
  },
};

export const mergeWithDefaultDesignTokens = (tokens: VeraUIConfig): VeraUIConfig => ({
  ...defaultDesignTokens,
  ...tokens,
  light: { ...defaultDesignTokens.light, ...tokens.light },
  dark: { ...defaultDesignTokens.dark, ...tokens.dark },
  headline: { ...defaultDesignTokens.headline, ...tokens.headline },
  subtitle: { ...defaultDesignTokens.subtitle, ...tokens.subtitle },
  heading1: { ...defaultDesignTokens.heading1, ...tokens.heading1 },
  heading2: { ...defaultDesignTokens.heading2, ...tokens.heading2 },
  heading3: { ...defaultDesignTokens.heading3, ...tokens.heading3 },
  heading4: { ...defaultDesignTokens.heading4, ...tokens.heading4 },
  bodyExtended: { ...defaultDesignTokens.bodyExtended, ...tokens.bodyExtended },
  bodyExtendedSemibold: {
    ...defaultDesignTokens.bodyExtendedSemibold,
    ...tokens.bodyExtendedSemibold,
  },
  bodyBase: { ...defaultDesignTokens.bodyBase, ...tokens.bodyBase },
  bodyBaseSemibold: { ...defaultDesignTokens.bodyBaseSemibold, ...tokens.bodyBaseSemibold },
  caption: { ...defaultDesignTokens.caption, ...tokens.caption },
  captionSemibold: { ...defaultDesignTokens.captionSemibold, ...tokens.captionSemibold },
});
