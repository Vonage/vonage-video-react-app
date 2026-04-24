import type { VeraUIConfig } from '@ui/theme/helpers/veraUI.types';

const tokensToCssVars = ({
  tokens: _tokens,
  selectedTheme,
}: {
  tokens: VeraUIConfig | null;
  selectedTheme: 'light' | 'dark';
}): CssVarsRecord => {
  const tokens = _tokens ?? {};
  const darkMode = selectedTheme === 'dark';
  const cssVars: CssVarsRecord = {};

  const lightColors = (tokens.light ?? {}) as Record<string, string>;
  const darkColors = (tokens.dark ?? {}) as Record<string, string>;

  Object.assign(cssVars, buildColorVars(lightColors, '-light'));
  Object.assign(cssVars, buildColorVars(darkColors, '-dark'));

  const themeColors = darkMode ? darkColors : lightColors;

  for (const [key, value] of Object.entries(themeColors)) {
    const segment = kebabToCssVarSegment(key);
    cssVars[`--vera-${segment}`] = value;
  }

  if (tokens.borderRadiusNone !== undefined)
    cssVars['--vera-border-radius-none'] = tokens.borderRadiusNone;
  if (tokens.borderRadiusExtraSmall !== undefined)
    cssVars['--vera-border-radius-extra-small'] = tokens.borderRadiusExtraSmall;
  if (tokens.borderRadiusSmall !== undefined)
    cssVars['--vera-border-radius-small'] = tokens.borderRadiusSmall;
  if (tokens.borderRadiusMedium !== undefined)
    cssVars['--vera-border-radius-medium'] = tokens.borderRadiusMedium;
  if (tokens.borderRadiusLarge !== undefined)
    cssVars['--vera-border-radius-large'] = tokens.borderRadiusLarge;
  if (tokens.borderRadiusExtraLarge !== undefined)
    cssVars['--vera-border-radius-extra-large'] = tokens.borderRadiusExtraLarge;

  if (tokens.fontFamilyPlain) cssVars['--vera-font-family-plain'] = tokens.fontFamilyPlain;

  const typographyKeys = [
    'headline',
    'subtitle',
    'heading1',
    'heading2',
    'heading3',
    'heading4',
    'bodyExtended',
    'bodyExtendedSemibold',
    'bodyBase',
    'bodyBaseSemibold',
    'caption',
    'captionSemibold',
  ] as const;

  const cssKeyMap: Record<string, string> = {
    heading1: 'heading-1',
    heading2: 'heading-2',
    heading3: 'heading-3',
    heading4: 'heading-4',
    bodyExtended: 'body-extended',
    bodyExtendedSemibold: 'body-extended-semibold',
    bodyBase: 'body-base',
    bodyBaseSemibold: 'body-base-semibold',
    captionSemibold: 'caption-semibold',
  };

  for (const key of typographyKeys) {
    const entry = tokens[key] as
      | {
          fontSize?: string;
          lineHeight?: string;
          fontWeight?: number | string;
          mobileFontSize?: string;
          mobileLineHeight?: string;
        }
      | undefined;

    if (!entry) continue;

    const cssKey = cssKeyMap[key] ?? key;

    if (entry.fontSize) cssVars[`--vera-typography-${cssKey}-font-size`] = entry.fontSize;
    if (entry.lineHeight) cssVars[`--vera-typography-${cssKey}-line-height`] = entry.lineHeight;
    if (entry.fontWeight !== undefined)
      cssVars[`--vera-typography-${cssKey}-font-weight`] = String(entry.fontWeight);
    if (entry.mobileFontSize)
      cssVars[`--vera-typography-${cssKey}-mobile-font-size`] = entry.mobileFontSize;
    if (entry.mobileLineHeight)
      cssVars[`--vera-typography-${cssKey}-mobile-line-height`] = entry.mobileLineHeight;
  }

  return cssVars;
};

type CssVarsRecord = Record<string, string>;

function kebabToCssVarSegment(key: string): string {
  return key.replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`);
}

function buildColorVars(colors: Record<string, string>, suffix: string): CssVarsRecord {
  const cssVars: CssVarsRecord = {};

  for (const [key, value] of Object.entries(colors)) {
    const segment = kebabToCssVarSegment(key);

    cssVars[`--vera-${segment}${suffix}`] = value;

    if (!suffix) {
      cssVars[`--vera-${segment}-light`] = value;
    }
  }

  return cssVars;
}

export default tokensToCssVars;
