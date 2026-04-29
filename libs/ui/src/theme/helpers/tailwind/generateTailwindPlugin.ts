import * as fs from 'node:fs';
import * as path from 'node:path';
// eslint-disable-next-line @nx/enforce-module-boundaries
import kebabToCamel from '../../../../../common/src/helpers/kebabToCamel';
import designTokens from '../designTokens/designTokens.json';
import tsDesignTokens from '../designTokens/designTokens.js';
import type {
  VeraTypographyTokenKey,
  VeraTypographyVariableNamesByToken,
  VeraUIConfig,
} from '../veraUI.types';
import { veraTypographyCssVariableNames } from '../veraUI.types';

const VERA_DARK_MODE_CLASS = 'vera-dark-mode';
const pluginFile = path.resolve('libs/ui/src/theme/helpers/tailwind/veraUI.cjs');

const veraTypographyVariableNames: Record<
  VeraTypographyTokenKey,
  VeraTypographyVariableNamesByToken
> = veraTypographyCssVariableNames;

const VERA_UI_CONFIG_JSDOC = `/**
 * @typedef {Object} VeraTypographyProperties
 * @property {string} [fontSize]
 * @property {string} [lineHeight]
 * @property {string} [fontWeight]
 * @property {string} [mobileFontSize]
 * @property {string} [mobileLineHeight]
 * @property {string} [mobileFontWeight]
 */
/**
 * @typedef {Object} VeraColorThemeConfig
 * @property {string} [accent]
 * @property {string} [alertBackground]
 * @property {string} [alertBackgroundHover]
 * @property {string} [alertText]
 * @property {string} [background]
 * @property {string} [border]
 * @property {string} [darkBackground]
 * @property {string} [darkGrey]
 * @property {string} [darkGreyHover]
 * @property {string} [darkGreyOpacity]
 * @property {string} [disabled]
 * @property {string} [error]
 * @property {string} [errorHover]
 * @property {string} [information]
 * @property {string} [informationBackground]
 * @property {string} [informationHover]
 * @property {string} [onAccent]
 * @property {string} [onBackground]
 * @property {string} [onDarkGrey]
 * @property {string} [onError]
 * @property {string} [onInformation]
 * @property {string} [onPrimary]
 * @property {string} [onSecondary]
 * @property {string} [onSuccess]
 * @property {string} [onSurface]
 * @property {string} [onTertiary]
 * @property {string} [onWarning]
 * @property {string} [primary]
 * @property {string} [primaryHover]
 * @property {string} [secondary]
 * @property {string} [secondaryHover]
 * @property {string} [skeletonLike]
 * @property {string} [success]
 * @property {string} [successHover]
 * @property {string} [surface]
 * @property {string} [tertiary]
 * @property {string} [tertiaryHover]
 * @property {string} [textDisabled]
 * @property {string} [textPrimary]
 * @property {string} [textSecondary]
 * @property {string} [textTertiary]
 * @property {string} [warning]
 * @property {string} [warningHover]
 */
/**
 * @typedef {Object} VeraUIConfig
 * @property {VeraColorThemeConfig} [light]
 * @property {VeraColorThemeConfig} [dark]
 * @property {string} [borderRadiusExtraLarge]
 * @property {string} [borderRadiusExtraSmall]
 * @property {string} [borderRadiusLarge]
 * @property {string} [borderRadiusMedium]
 * @property {string} [borderRadiusNone]
 * @property {string} [borderRadiusSmall]
 * @property {string} [fontFamilyPlain]
 * @property {VeraTypographyProperties} [headline]
 * @property {VeraTypographyProperties} [subtitle]
 * @property {VeraTypographyProperties} [heading1]
 * @property {VeraTypographyProperties} [heading2]
 * @property {VeraTypographyProperties} [heading3]
 * @property {VeraTypographyProperties} [heading4]
 * @property {VeraTypographyProperties} [bodyExtended]
 * @property {VeraTypographyProperties} [bodyExtendedSemibold]
 * @property {VeraTypographyProperties} [bodyBase]
 * @property {VeraTypographyProperties} [bodyBaseSemibold]
 * @property {VeraTypographyProperties} [caption]
 * @property {VeraTypographyProperties} [captionSemibold]
 */

/**
 * @param {VeraUIConfig} [config={}]
 */`;

const typographyTokenByConfigKey = {
  headline: 'headline',
  subtitle: 'subtitle',
  heading1: 'heading-1',
  heading2: 'heading-2',
  heading3: 'heading-3',
  heading4: 'heading-4',
  bodyExtended: 'body-extended',
  bodyExtendedSemibold: 'body-extended-semibold',
  bodyBase: 'body-base',
  bodyBaseSemibold: 'body-base-semibold',
  caption: 'caption',
  captionSemibold: 'caption-semibold',
} as const;

function camelToKebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function buildDefaultVeraUIConfig(): VeraUIConfig {
  const { color, border, typography } = tsDesignTokens;

  const light = Object.fromEntries(
    Object.entries(color.light).map(([key, token]) => [kebabToCamel(key), token.value])
  ) as VeraUIConfig['light'];

  const dark = Object.fromEntries(
    Object.entries(color.dark).map(([key, token]) => [kebabToCamel(key), token.value])
  ) as VeraUIConfig['dark'];

  const typo = (tokenKey: keyof typeof typographyTokenByConfigKey): VeraUIConfig['headline'] => {
    const tsKey = typographyTokenByConfigKey[tokenKey];
    const desktop = typography.typeScale.desktop[tsKey];
    const mobile = typography.typeScale.mobile[tsKey];
    return {
      fontSize: desktop.fontSize.value,
      lineHeight: desktop.lineHeight.value,
      fontWeight: String(desktop.fontWeight.value),
      mobileFontSize: mobile.fontSize.value,
      mobileLineHeight: mobile.lineHeight.value,
      mobileFontWeight: String(mobile.fontWeight.value),
    };
  };

  return {
    light,
    dark,
    borderRadiusNone: border.none.value,
    borderRadiusExtraSmall: border['extra-small'].value,
    borderRadiusSmall: border.small.value,
    borderRadiusMedium: border.medium.value,
    borderRadiusLarge: border.large.value,
    borderRadiusExtraLarge: border['extra-large'].value,
    fontFamilyPlain: typography.typeface.plain.value,
    headline: typo('headline'),
    subtitle: typo('subtitle'),
    heading1: typo('heading1'),
    heading2: typo('heading2'),
    heading3: typo('heading3'),
    heading4: typo('heading4'),
    bodyExtended: typo('bodyExtended'),
    bodyExtendedSemibold: typo('bodyExtendedSemibold'),
    bodyBase: typo('bodyBase'),
    bodyBaseSemibold: typo('bodyBaseSemibold'),
    caption: typo('caption'),
    captionSemibold: typo('captionSemibold'),
  };
}

function mergeVeraUIConfig(defaults: VeraUIConfig, partial: VeraUIConfig): VeraUIConfig {
  return {
    ...defaults,
    ...partial,
    light: { ...defaults.light, ...partial.light },
    dark: { ...defaults.dark, ...partial.dark },
    headline: { ...defaults.headline, ...partial.headline },
    subtitle: { ...defaults.subtitle, ...partial.subtitle },
    heading1: { ...defaults.heading1, ...partial.heading1 },
    heading2: { ...defaults.heading2, ...partial.heading2 },
    heading3: { ...defaults.heading3, ...partial.heading3 },
    heading4: { ...defaults.heading4, ...partial.heading4 },
    bodyExtended: { ...defaults.bodyExtended, ...partial.bodyExtended },
    bodyExtendedSemibold: { ...defaults.bodyExtendedSemibold, ...partial.bodyExtendedSemibold },
    bodyBase: { ...defaults.bodyBase, ...partial.bodyBase },
    bodyBaseSemibold: { ...defaults.bodyBaseSemibold, ...partial.bodyBaseSemibold },
    caption: { ...defaults.caption, ...partial.caption },
    captionSemibold: { ...defaults.captionSemibold, ...partial.captionSemibold },
  };
}

function normalizeDesignTokensFromConfig(config: VeraUIConfig): {
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  borderRadius: Record<string, string>;
  fontFamily: Record<string, string>;
  fontSize: {
    desktop: Record<string, { fontSize: string; lineHeight: string; fontWeight: string }>;
    mobile: Record<string, { fontSize: string; lineHeight: string; fontWeight: string }>;
  };
} {
  const lightColors = Object.fromEntries(
    Object.entries(config.light ?? {}).map(([key, tokenValue]) => [camelToKebab(key), tokenValue])
  );

  const darkColors = Object.fromEntries(
    Object.entries(config.dark ?? {}).map(([key, tokenValue]) => [camelToKebab(key), tokenValue])
  );

  const borderRadius = Object.fromEntries(
    Object.entries(config)
      .filter(([key]) => key.startsWith('borderRadius'))
      .map(([key, tokenValue]) => [camelToKebab(key.replace('borderRadius', '')), tokenValue])
  ) as Record<string, string>;

  const fontFamily = Object.fromEntries(
    Object.entries(config)
      .filter(([key]) => key.startsWith('fontFamily'))
      .map(([key, tokenValue]) => [camelToKebab(key.replace('fontFamily', '')), tokenValue])
  ) as Record<string, string>;

  const desktopFontSize: Record<
    string,
    {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
    }
  > = {};

  const mobileFontSize: Record<
    string,
    {
      fontSize: string;
      lineHeight: string;
      fontWeight: string;
    }
  > = {};

  for (const [configKey, tokenKey] of Object.entries(typographyTokenByConfigKey)) {
    const typographyValues = config[configKey as keyof VeraUIConfig] as
      | {
          fontSize?: string;
          lineHeight?: string;
          fontWeight?: string;
          mobileFontSize?: string;
          mobileLineHeight?: string;
          mobileFontWeight?: string;
        }
      | undefined;

    desktopFontSize[tokenKey] = {
      fontSize: typographyValues?.fontSize ?? '',
      lineHeight: typographyValues?.lineHeight ?? '',
      fontWeight: typographyValues?.fontWeight ?? '',
    };

    mobileFontSize[tokenKey] = {
      fontSize: typographyValues?.mobileFontSize ?? typographyValues?.fontSize ?? '',
      lineHeight: typographyValues?.mobileLineHeight ?? typographyValues?.lineHeight ?? '',
      fontWeight: typographyValues?.mobileFontWeight ?? typographyValues?.fontWeight ?? '',
    };
  }

  return {
    colors: {
      light: lightColors,
      dark: darkColors,
    },
    borderRadius,
    fontFamily,
    fontSize: {
      desktop: desktopFontSize,
      mobile: mobileFontSize,
    },
  };
}

/**
 * Extracts the config path from a CSS variable name.
 * Examples:
 * - '--vera-accent' -> 'accent'
 * - '--vera-alert-background' -> 'alertBackground'
 * - '--vera-typography-headline-font-size' -> 'headline?.fontSize'
 * - '--vera-typography-heading-1-font-size' -> 'heading1?.fontSize'
 * - '--vera-typography-body-extended-font-size' -> 'bodyExtended?.fontSize'
 */
function getCssVariableConfigPath(variableName: string): string {
  // Remove '--vera-' prefix
  const withoutPrefix = variableName.replace('--vera-', '');

  // Handle typography special case: strip the known property suffix from the end
  // Properties are always: font-size, line-height, or font-weight
  if (withoutPrefix.startsWith('typography-')) {
    const typographySuffix = withoutPrefix.replace('typography-', '');
    const propertySuffixes = [
      '-mobile-font-size',
      '-mobile-line-height',
      '-mobile-font-weight',
      '-font-size',
      '-line-height',
      '-font-weight',
    ];

    for (const suffix of propertySuffixes) {
      if (typographySuffix.endsWith(suffix)) {
        const tokenKey = typographySuffix.slice(0, -suffix.length);
        const propertyKey = kebabToCamel(suffix.slice(1));
        return `${kebabToCamel(tokenKey)}?.${propertyKey}`;
      }
    }
  }

  return kebabToCamel(withoutPrefix);
}

/**
 * Generates a config lookup expression with fallback value.
 * Example: 'light.accent ?? "#FFFFFF"'
 */
function generateConfigLookup(
  theme: 'light' | 'dark',
  configPath: string,
  fallbackValue: string
): string {
  return `config.${configPath} ?? ${theme}.${configPath} ?? '${fallbackValue}'`;
}

/**
 * Generates a config lookup expression for non-theme-aware variables.
 * All layout, font, and typography tokens are configurable at the root level.
 */
function generateGlobalConfigLookup(variableName: string, fallbackValue: string): string {
  if (variableName.startsWith('--vera-typography-')) {
    const configPath = getCssVariableConfigPath(variableName);
    return `config.${configPath} ?? '${fallbackValue}'`;
  }

  if (variableName.startsWith('--vera-border-radius-')) {
    const key = variableName.replace('--vera-', '');
    const configKey = kebabToCamel(key);
    return `config.${configKey} ?? '${fallbackValue}'`;
  }

  if (variableName.startsWith('--vera-font-family-')) {
    const key = variableName.replace('--vera-', '');
    const configKey = kebabToCamel(key);
    return `config.${configKey} ?? '${fallbackValue}'`;
  }

  return `'${fallbackValue}'`;
}

/**
 * Generates addBase color and typography variables with config lookups.
 */
function generateAddBaseVariablesWithConfig(
  lightColors: Record<string, string>,
  darkColors: Record<string, string>,
  typographyAndLayoutVariables: Record<string, string>,
  indentation: string
): { rootVars: string; darkVars: string } {
  const rootLines: string[] = [];
  const darkLines: string[] = [];

  const colorKeys = Object.keys(lightColors).sort((a, b) => a.localeCompare(b));

  // Generate variables in original order: for each key, add theme-aware then static variants
  for (const key of colorKeys) {
    const lightValue = lightColors[key];
    const darkValue = darkColors[key];
    const cssVarName = `--vera-${key}`;
    const configPath = getCssVariableConfigPath(cssVarName);
    const lightConfigLookup = generateConfigLookup('light', configPath, lightValue);
    const darkConfigLookup = generateConfigLookup('dark', configPath, darkValue);

    // Theme-aware color (changes with theme)
    rootLines.push(`${indentation}'${cssVarName}': ${lightConfigLookup},`);
    darkLines.push(`${indentation}'${cssVarName}': ${darkConfigLookup},`);

    // Light variant (always uses light theme from config)
    rootLines.push(`${indentation}'--vera-${key}-light': ${lightConfigLookup},`);

    // Dark variant (always uses dark theme from config)
    rootLines.push(`${indentation}'--vera-${key}-dark': ${darkConfigLookup},`);
  }

  // Add typography and layout variables (remain static)
  const typographyKeys = Object.keys(typographyAndLayoutVariables);

  // Add blank line and comment before typography section
  rootLines.push('');
  rootLines.push(`${indentation}// Typography and layout design tokens`);

  for (const key of typographyKeys) {
    const value = typographyAndLayoutVariables[key];
    const configLookup = generateGlobalConfigLookup(key, value);
    rootLines.push(`${indentation}'${key}': ${configLookup},`);
  }

  return {
    rootVars: rootLines.join('\n'),
    darkVars: darkLines.join('\n'),
  };
}

/**
 * Generates a comprehensive Tailwind plugin with all Vera design tokens.
 * This script reads from designTokens.json and generates veraUI.cjs
 * The plugin extends Tailwind's theme with semantic tokens that are:
 * - Theme-aware (colors respond to .dark class via CSS variables)
 * - Responsive (font sizes respond to screen size)
 * - Overridable by the user
 */
function generateVeraUIPlugin() {
  const mergedConfig = mergeVeraUIConfig(buildDefaultVeraUIConfig(), designTokens as VeraUIConfig);
  const normalizedDesignTokens = normalizeDesignTokensFromConfig(mergedConfig);
  const { desktop: fontSizeDesktop, mobile: fontSizeMobile } = normalizedDesignTokens.fontSize;

  const { colorTokens } = generateColorTokens(
    normalizedDesignTokens.colors.light,
    normalizedDesignTokens.colors.dark
  );
  const typographyAndLayoutVariables = generateTypographyAndLayoutVariables({
    borderRadius: normalizedDesignTokens.borderRadius,
    fontFamily: normalizedDesignTokens.fontFamily,
    fontSizeDesktop,
    fontSizeMobile,
  });

  const borderRadius = generateBorderRadiusTokens(normalizedDesignTokens.borderRadius);
  const fontFamily = generateFontFamilyTokens(normalizedDesignTokens.fontFamily);
  const screens = {
    'vera-mobile': { max: '767px' },
    'vera-desktop': { min: '768px' },
  };

  // Generate addBase variables with config lookups
  const { rootVars, darkVars } = generateAddBaseVariablesWithConfig(
    normalizedDesignTokens.colors.light,
    normalizedDesignTokens.colors.dark,
    typographyAndLayoutVariables,
    '        '
  );

  let plugin = `/**
 * Auto-generated Tailwind plugin for Vera design system
 * DO NOT EDIT MANUALLY - Generated by generateTailwindPlugin.ts
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const plugin = require('tailwindcss/plugin');

${VERA_UI_CONFIG_JSDOC}

const veraUI = (config = {}) => {
return plugin(
  ({ addUtilities, addBase, addVariant }) => {
    const { light = {}, dark = {} } = config; // also includes typography and layout
    const fontSizeUtilities = {};
    const fontWeightUtilities = {};

    // Add custom variants
    addVariant('child', '& > *');

    // Add CSS variables for theme-aware colors
    addBase({
      ':host, :root': {
${rootVars}
      },
      ':host(.vera-dark-mode), :host(.dark), html.vera-dark-mode': {
${darkVars}
      },
    });
`;

  // Generate font size utilities
  for (const key of Object.keys(fontSizeDesktop)) {
    const mobile = fontSizeMobile[key] ?? {
      fontSize: '1rem',
      lineHeight: '1.5rem',
      fontWeight: '400',
    };

    const desktop = fontSizeDesktop[key] ?? mobile;

    const desktopVariableNames = veraTypographyVariableNames[key as VeraTypographyTokenKey];

    plugin += `    // ${key}\n`;
    plugin += `    fontSizeUtilities['.text-vera-${key}'] = {\n`;
    plugin += `      fontSize: '${mobile.fontSize}',\n`;
    plugin += `      lineHeight: '${mobile.lineHeight}',\n`;
    plugin += `      fontWeight: ${mobile.fontWeight},\n`;
    plugin += `      '@media (min-width: 768px)': {\n`;
    plugin += `        fontSize: 'var(${desktopVariableNames.fontSize}, ${desktop.fontSize})',\n`;
    plugin += `        lineHeight: 'var(${desktopVariableNames.lineHeight}, ${desktop.lineHeight})',\n`;
    plugin += `        fontWeight: 'var(${desktopVariableNames.fontWeight}, ${desktop.fontWeight})',\n`;
    plugin += `      },\n`;
    plugin += `    };\n\n`;

    // Generate responsive font weight utilities
    plugin += `    fontWeightUtilities['.font-vera-${key}'] = {\n`;
    plugin += `      fontWeight: ${mobile.fontWeight},\n`;
    plugin += `      '@media (min-width: 768px)': {\n`;
    plugin += `        fontWeight: 'var(${desktopVariableNames.fontWeight}, ${desktop.fontWeight})',\n`;
    plugin += `      },\n`;
    plugin += `    };\n\n`;
  }

  plugin += `    addUtilities(fontSizeUtilities);
    addUtilities(fontWeightUtilities);
  },
  {
    theme: {
      extend: {
        borderRadius: ${generateBorderRadiusThemeConfig(borderRadius)},
        colors: ${JSON.stringify(colorTokens, null, 6).replace(/\n/g, '\n        ')},
        fontFamily: ${generateFontFamilyThemeConfig(fontFamily)},
        screens: ${JSON.stringify(screens, null, 6).replace(/\n/g, '\n        ')},
      },
    },
  }
);
};

veraUI.safelist = ['${VERA_DARK_MODE_CLASS}'];

module.exports = veraUI;
`;

  fs.mkdirSync(path.dirname(pluginFile), { recursive: true });
  fs.writeFileSync(pluginFile, plugin, 'utf-8');
  console.log(`\x1b[32m✔ Tailwind plugin written to ${pluginFile}\x1b[0m`);
}

/**
 * Generates theme-aware color tokens with CSS variables.
 * Creates CSS custom properties that respond to theme changes via body.dark class.
 *
 * Returns:
 * - colorVariables: CSS variables for :root and body.dark
 * - colorTokens: Tailwind color tokens that reference the CSS variables
 *
 * Generated variants:
 * - vera-{key}: theme-aware (uses --vera-{key} variable)
 * - vera-{key}-light: static light color (uses --vera-{key}-light variable)
 * - vera-{key}-dark: static dark color (uses --vera-{key}-dark variable)
 *
 * Tokens are sorted alphabetically by base name for consistent output.
 *
 * Usage:
 *   className="bg-vera-primary" (theme-aware)
 *   className="bg-vera-primary-light" (always light)
 *   className="bg-vera-primary-dark" (always dark)
 */
function generateColorTokens(
  lightColors: Record<string, string>,
  darkColors: Record<string, string>
): {
  colorVariables: { root: Record<string, string>; dark: Record<string, string> };
  colorTokens: Record<string, string>;
} {
  const rootVariables: Record<string, string> = {};
  const darkVariables: Record<string, string> = {};
  const colorTokens: Record<string, string> = {};

  // Sort keys alphabetically for consistent output
  const sortedKeys = Object.keys(lightColors).sort((a, b) => a.localeCompare(b));

  // Generate CSS variables and color tokens
  for (const key of sortedKeys) {
    const light = lightColors[key];
    const dark = darkColors[key];

    // CSS variables for theme-aware color
    rootVariables[`--vera-${key}`] = light;
    darkVariables[`--vera-${key}`] = dark;

    // CSS variables for static variants (don't change with theme)
    rootVariables[`--vera-${key}-light`] = light;
    rootVariables[`--vera-${key}-dark`] = dark;

    // Tailwind color tokens that reference CSS variables with fallback values
    colorTokens[`vera-${key}`] = `var(--vera-${key}, ${light})`;
    colorTokens[`vera-${key}-light`] = `var(--vera-${key}-light, ${light})`;
    colorTokens[`vera-${key}-dark`] = `var(--vera-${key}-dark, ${dark})`;
  }

  return {
    colorVariables: {
      root: rootVariables,
      dark: darkVariables,
    },
    colorTokens,
  };
}

/**
 * Generates border radius tokens with vera- prefix.
 * Values reference CSS variables with fallbacks for runtime customization.
 * Tokens are sorted alphabetically for consistent output.
 */
function generateBorderRadiusTokens(border: Record<string, string>): Record<string, string> {
  const borderRadius: Record<string, string> = {};

  // Sort keys alphabetically for consistent output
  const sortedKeys = Object.keys(border).sort((a, b) => a.localeCompare(b));

  for (const key of sortedKeys) {
    borderRadius[`vera-${key}`] = `var(--vera-border-radius-${key}, ${border[key]})`;
  }

  return borderRadius;
}

/**
 * Generates a JS object literal string for the borderRadius theme config.
 */
function generateBorderRadiusThemeConfig(borderRadius: Record<string, string>): string {
  const entries = Object.entries(borderRadius)
    .map(([key, value]) => `          '${key}': '${value}',`)
    .join('\n');
  return `{\n${entries}\n        }`;
}

/**
 * Generates font family tokens with vera- prefix.
 * Values reference CSS variables for runtime customization.
 * Tokens are sorted alphabetically for consistent output.
 */
function generateFontFamilyTokens(typeface: Record<string, string>): Record<string, string> {
  const fontFamily: Record<string, string> = {};

  // Sort keys alphabetically for consistent output
  const sortedKeys = Object.keys(typeface).sort((a, b) => a.localeCompare(b));

  for (const key of sortedKeys) {
    fontFamily[`vera-${key}`] = `var(--vera-font-family-${key}, ${typeface[key]})`;
  }

  return fontFamily;
}

/**
 * Generates a JS object literal string for the fontFamily theme config.
 */
function generateFontFamilyThemeConfig(fontFamily: Record<string, string>): string {
  const entries = Object.entries(fontFamily)
    .map(([key, value]) => `          '${key}': ['${value}'],`)
    .join('\n');
  return `{\n${entries}\n        }`;
}

/**
 * Generates typography and layout CSS variables for the Vera framework.
 * The temporary MUI custom theme can consume these variables, but the variables
 * themselves are framework design tokens rather than adapter-only values.
 */
function generateTypographyAndLayoutVariables(args: {
  borderRadius: Record<string, string>;
  fontFamily: Record<string, string>;
  fontSizeDesktop: Record<string, { fontSize: string; lineHeight: string; fontWeight: string }>;
  fontSizeMobile: Record<string, { fontSize: string; lineHeight: string; fontWeight: string }>;
}): Record<string, string> {
  const variables: Record<string, string> = {};

  // Add ALL border radius CSS variables
  const borderRadiusKeys = Object.keys(args.borderRadius).sort((a, b) => a.localeCompare(b));
  for (const key of borderRadiusKeys) {
    const cssVarName = `--vera-border-radius-${key}` as const;
    variables[cssVarName] = args.borderRadius[key];
  }

  // Add font family CSS variables
  const fontFamilyKeys = Object.keys(args.fontFamily).sort((a, b) => a.localeCompare(b));
  for (const key of fontFamilyKeys) {
    const cssVarName = `--vera-font-family-${key}` as const;
    variables[cssVarName] = args.fontFamily[key];
  }

  const usedTokenKeys: VeraTypographyTokenKey[] = [
    'headline',
    'subtitle',
    'heading-1',
    'heading-2',
    'heading-3',
    'heading-4',
    'body-extended',
    'body-extended-semibold',
    'body-base',
    'body-base-semibold',
    'caption',
    'caption-semibold',
  ];

  for (const tokenKey of usedTokenKeys) {
    const cssVariableNames = veraTypographyVariableNames[tokenKey];
    const desktop = args.fontSizeDesktop[tokenKey];
    const mobile = args.fontSizeMobile[tokenKey];

    variables[cssVariableNames.fontSize] = desktop.fontSize;
    variables[cssVariableNames.lineHeight] = desktop.lineHeight;
    variables[cssVariableNames.fontWeight] = desktop.fontWeight;
    variables[`--vera-typography-${tokenKey}-mobile-font-size`] = mobile.fontSize;
    variables[`--vera-typography-${tokenKey}-mobile-line-height`] = mobile.lineHeight;
    variables[`--vera-typography-${tokenKey}-mobile-font-weight`] = mobile.fontWeight;
  }

  return variables;
}

// Run the generation
generateVeraUIPlugin();
