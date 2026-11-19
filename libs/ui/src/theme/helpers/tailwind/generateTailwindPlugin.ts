import * as fs from 'node:fs';
import * as path from 'node:path';
import designTokens from '../designTokens/designTokens.json';
import type {
  TypographyScale,
  VeraThemeTokens,
  VeraTypographyTokenKey,
  VeraTypographyVariableNamesByToken,
} from '../veraUI.types';
import { veraTypographyCssVariableNames } from '../veraUI.types';

const VERA_DARK_MODE_CLASS = 'vera-dark-mode';
const pluginFile = path.resolve('libs/ui/src/theme/helpers/tailwind/veraUI.cjs');

const veraTypographyVariableNames: Record<
  VeraTypographyTokenKey,
  VeraTypographyVariableNamesByToken
> = veraTypographyCssVariableNames;

const TYPOGRAPHY_TOKEN_KEYS: VeraTypographyTokenKey[] = [
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

const VERA_UI_CONFIG_JSDOC = `/**
 * @param {import('../veraUI.types').VeraThemeTokens} [config] Optional theme
 * document (the same standardized designTokens.json shape). When provided, its
 * values override the baked-in defaults at runtime, which is what enables
 * live theme updates in dev without regenerating this file.
 */`;

/**
 * Runtime resolver helpers that are emitted verbatim into the generated plugin.
 *
 * Keeping the branching (?? / ternaries / unit conversions) inside these small,
 * single-purpose functions is what keeps the main plugin callback linear: each
 * addBase entry becomes a plain function call instead of an inline conditional
 * expression. That is what holds the callback's cognitive complexity down.
 */
const RUNTIME_RESOLVERS = `/**
 * Resolves a theme-aware color from the runtime config, falling back to the
 * value baked in from designTokens.json.
 */
const resolveColor = (config, mode, key, fallback) => config.colors?.[mode]?.[key] ?? fallback;

/**
 * Resolves a border radius token. Config values are plain numbers and get a
 * 'px' suffix; the fallback is already a full px string.
 */
const resolveBorderRadius = (config, key, fallback) => {
  const value = config.borderRadius?.[key];
  if (value == null) return fallback;
  return value + 'px';
};

/**
 * Resolves the plain font-family, falling back to the baked default.
 */
const resolveFontFamily = (config, fallback) => config.typography?.['font-family'] ?? fallback;

/**
 * Resolves a typography size (font-size / line-height). Config values are px
 * strings that get converted to rem; the fallback is already a rem string.
 */
const resolveTypographySize = (config, viewport, tokenKey, prop, fallback) => {
  const value = config.typography?.[viewport]?.[tokenKey]?.[prop];
  if (!value) return fallback;
  return Number(value.slice(0, -2)) / 16 + 'rem';
};

/**
 * Resolves a typography font-weight. Config values are numbers coerced to a
 * string; the fallback is already a string.
 */
const resolveTypographyWeight = (config, viewport, tokenKey, fallback) => {
  const value = config.typography?.[viewport]?.[tokenKey]?.['font-weight'];
  if (value == null) return fallback;
  return String(value);
};`;

type NormalizedTypographyStyle = { fontSize: string; lineHeight: string; fontWeight: string };

type NormalizedDesignTokens = {
  colors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  borderRadius: Record<string, string>;
  fontFamily: Record<string, string>;
  fontSize: {
    desktop: Record<string, NormalizedTypographyStyle>;
    mobile: Record<string, NormalizedTypographyStyle>;
  };
};

/**
 * Converts a px string (e.g. "24px") to a rem string (e.g. "1.5rem") using the
 * 16px = 1rem base. Non-px values are returned untouched.
 */
function pxToRem(value: string): string {
  if (!value.endsWith('px')) return value;
  const px = Number(value.slice(0, -2));
  return `${px / 16}rem`;
}

/**
 * Normalizes the designTokens.json document into the kebab-case, emit-ready
 * shape consumed by the token emitters. This is the single representation used
 * throughout the pipeline: colors stay kebab-case, border radius numbers become
 * px strings, and typography px sizes become rem.
 */
function normalizeThemeTokens(tokens: VeraThemeTokens): NormalizedDesignTokens {
  const borderRadius = Object.fromEntries(
    Object.entries(tokens.borderRadius).map(([key, value]) => [key, `${value}px`])
  );

  const fontFamily = { plain: tokens.typography['font-family'] };

  const toViewport = (viewport: TypographyScale): Record<string, NormalizedTypographyStyle> =>
    Object.fromEntries(
      TYPOGRAPHY_TOKEN_KEYS.map((tokenKey) => {
        const style = viewport[tokenKey];
        return [
          tokenKey,
          {
            fontSize: pxToRem(style['font-size']),
            lineHeight: pxToRem(style['line-height']),
            fontWeight: String(style['font-weight']),
          },
        ];
      })
    );

  return {
    colors: {
      light: tokens.colors.light,
      dark: tokens.colors.dark,
    },
    borderRadius,
    fontFamily,
    fontSize: {
      desktop: toViewport(tokens.typography.desktop),
      mobile: toViewport(tokens.typography.mobile),
    },
  };
}

/**
 * Produces a single-quoted JS string literal for a fallback value.
 */
function toStringLiteral(value: string): string {
  const escapedSingleQuote = String.raw`\'`;
  const escapedValue = value.replaceAll("'", escapedSingleQuote);
  return `'${escapedValue}'`;
}

/**
 * Builds the runtime lookup expression for a typography/layout CSS variable.
 * It reads the raw (standardized) config passed to veraUI(), applying the unit
 * conversions inline (border number -> px, typography px -> rem), and falls
 * back to the baked value. Examples:
 * - '--vera-border-radius-medium'          -> config.borderRadius?.medium != null ? config.borderRadius.medium + 'px' : '8px'
 * - '--vera-font-family-plain'             -> config.typography?.['font-family'] ?? 'Inter, ...'
 * - '--vera-typography-headline-font-size' -> pxStr ? Number(pxStr.slice(0,-2))/16 + 'rem' : '4.125rem'
 */
const BORDER_RADIUS_VARIABLE_PATTERN = /^--vera-border-radius-(.+)$/;
const TYPOGRAPHY_VARIABLE_PATTERN = /^--vera-typography-(.+)-(font-size|line-height|font-weight)$/;

function typographyOrLayoutLookup(cssVarName: string, bakedValue: string): string {
  const fallback = toStringLiteral(bakedValue);

  const borderRadiusKey = BORDER_RADIUS_VARIABLE_PATTERN.exec(cssVarName);
  if (borderRadiusKey) {
    return `resolveBorderRadius(config, '${borderRadiusKey[1]}', ${fallback})`;
  }

  if (cssVarName === '--vera-font-family-plain') {
    return `resolveFontFamily(config, ${fallback})`;
  }

  const typography = TYPOGRAPHY_VARIABLE_PATTERN.exec(cssVarName);
  if (typography) {
    const [, rawToken, prop] = typography;
    const isMobile = rawToken.endsWith('-mobile');
    const tokenKey = isMobile ? rawToken.slice(0, -'-mobile'.length) : rawToken;
    const viewport = isMobile ? 'mobile' : 'desktop';

    // font-weight is a number in the config; sizes are px strings -> rem.
    if (prop === 'font-weight') {
      return `resolveTypographyWeight(config, '${viewport}', '${tokenKey}', ${fallback})`;
    }
    return `resolveTypographySize(config, '${viewport}', '${tokenKey}', '${prop}', ${fallback})`;
  }

  return fallback;
}

/**
 * Generates the addBase color and typography CSS variables. Each variable reads
 * the runtime config (normalized to the internal lookup shape) and falls back
 * to the value baked in from designTokens.json. This keeps runtime overrides
 * working (live theme updates) while defaults require no config.
 */
function generateAddBaseVariables(
  lightColors: Record<string, string>,
  darkColors: Record<string, string>,
  typographyAndLayoutVariables: Record<string, string>,
  indentation: string
): { rootVars: string; darkVars: string } {
  const rootLines: string[] = [];
  const darkLines: string[] = [];

  const colorKeys = Object.keys(lightColors).sort((a, b) => a.localeCompare(b));

  // For each color: theme-aware variable (light in :root, dark in dark scope)
  // plus static light/dark variants. Each reads the runtime override first.
  for (const key of colorKeys) {
    const lightLookup = `resolveColor(config, 'light', '${key}', ${toStringLiteral(lightColors[key])})`;
    const darkLookup = `resolveColor(config, 'dark', '${key}', ${toStringLiteral(darkColors[key])})`;
    const cssVarName = `--vera-${key}`;

    // Theme-aware color (changes with theme) plus static light/dark variants.
    rootLines.push(
      `${indentation}'${cssVarName}': ${lightLookup},`,
      `${indentation}'--vera-${key}-light': ${lightLookup},`,
      `${indentation}'--vera-${key}-dark': ${darkLookup},`
    );
    darkLines.push(`${indentation}'${cssVarName}': ${darkLookup},`);
  }

  // Typography and layout variables (not theme-aware)
  rootLines.push('', `${indentation}// Typography and layout design tokens`);
  for (const [key, value] of Object.entries(typographyAndLayoutVariables)) {
    rootLines.push(`${indentation}'${key}': ${typographyOrLayoutLookup(key, value)},`);
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
  // designTokens.json is the single source of truth. Its values are normalized
  // (kebab-case, border numbers -> px, typography px -> rem) and baked directly
  // into the generated plugin.
  const normalizedDesignTokens = normalizeThemeTokens(designTokens as VeraThemeTokens);
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

  // Generate addBase variables with values baked in directly
  const { rootVars, darkVars } = generateAddBaseVariables(
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

${RUNTIME_RESOLVERS}

${VERA_UI_CONFIG_JSDOC}

const veraUI = (config = {}) => {
return plugin(
  ({ addUtilities, addBase, addVariant }) => {
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
        colors: ${JSON.stringify(colorTokens, null, 6).replaceAll('\n', '\n        ')},
        fontFamily: ${generateFontFamilyThemeConfig(fontFamily)},
        screens: ${JSON.stringify(screens, null, 6).replaceAll('\n', '\n        ')},
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
