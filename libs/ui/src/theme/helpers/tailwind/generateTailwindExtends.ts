import * as fs from 'node:fs';
import * as path from 'node:path';
import designTokens from '../designTokens/designTokens.json';

const outputFile = path.resolve('libs/ui/src/theme/helpers/tailwind/tailwindExtends.json');

/**
 * Generates a comprehensive Tailwind extends configuration with vera- prefix.
 * This script reads from designTokens.json and generates tailwindExtends.json
 */
function generateTailwindExtends() {
  const tailwindExtends = {
    colors: generateColorTokens(designTokens.colors.light, designTokens.colors.dark),
    borderRadius: generateBorderRadiusTokens(designTokens.borderRadius),
    fontFamily: generateFontFamilyTokens(designTokens.fontFamily),
    fontSize: generateFontSizeTokens(designTokens.fontSize.desktop, designTokens.fontSize.mobile),
    fontWeight: generateFontWeightTokens(designTokens.fontWeight),
    screens: {
      'vera-mobile': { max: '767px' },
      'vera-desktop': { min: '768px' },
    },
  };

  // Ensure parent directory exists
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  // Write Tailwind extends to JSON with consistent ordering
  fs.writeFileSync(outputFile, JSON.stringify(tailwindExtends, null, 2) + '\n', {
    flag: 'w',
  });

  console.log(`\x1b[32m✔ Tailwind extends JSON written to ${outputFile}\x1b[0m`);
}

/**
 * Generates color tokens with vera- prefix for both light and dark themes.
 * Maintains the same order as the source design tokens.
 */
function generateColorTokens(
  lightColors: Record<string, string>,
  darkColors: Record<string, string>
): Record<string, string> {
  const colors: Record<string, string> = {};

  // Add light theme colors with vera- prefix (maintaining order)
  for (const key of Object.keys(lightColors)) {
    colors[`vera-${key}`] = lightColors[key];
  }

  // Add dark theme colors with vera-dark- prefix (maintaining order)
  for (const key of Object.keys(darkColors)) {
    colors[`vera-dark-${key}`] = darkColors[key];
  }

  return colors;
}

/**
 * Generates border radius tokens with vera- prefix.
 * Keeps original names from designTokens.json.
 */
function generateBorderRadiusTokens(shape: Record<string, string>): Record<string, string> {
  const borderRadius: Record<string, string> = {};

  for (const key of Object.keys(shape)) {
    borderRadius[`vera-${key}`] = shape[key];
  }

  return borderRadius;
}

/**
 * Generates font family tokens with vera- prefix.
 * Maintains the same order as the source design tokens.
 */
function generateFontFamilyTokens(typeface: Record<string, string>): Record<string, string[]> {
  const fontFamily: Record<string, string[]> = {};

  for (const key of Object.keys(typeface)) {
    fontFamily[`vera-${key}`] = typeface[key].split(', ');
  }

  return fontFamily;
}

type FontSizeConfig = {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
};

/**
 * Generates font size tokens with vera- prefix for both desktop and mobile.
 * Keeps original names from designTokens.json.
 */
function generateFontSizeTokens(
  desktopFontSize: Record<string, FontSizeConfig>,
  mobileFontSize: Record<string, FontSizeConfig>
): Record<string, [string, { lineHeight: string; fontWeight: number }]> {
  const fontSize: Record<string, [string, { lineHeight: string; fontWeight: number }]> = {};

  // Add desktop font sizes with original names
  for (const key of Object.keys(desktopFontSize)) {
    const value = desktopFontSize[key];
    fontSize[`vera-desktop-${key}`] = [
      value.fontSize,
      {
        lineHeight: value.lineHeight,
        fontWeight: Number(value.fontWeight),
      },
    ];
  }

  // Add mobile font sizes with original names
  for (const key of Object.keys(mobileFontSize)) {
    const value = mobileFontSize[key];
    fontSize[`vera-mobile-${key}`] = [
      value.fontSize,
      {
        lineHeight: value.lineHeight,
        fontWeight: Number(value.fontWeight),
      },
    ];
  }

  return fontSize;
}

/**
 * Generates font weight tokens with vera- prefix.
 * Keeps original names from designTokens.json.
 */
function generateFontWeightTokens(weights: Record<string, number>): Record<string, number> {
  const fontWeight: Record<string, number> = {};

  for (const key of Object.keys(weights)) {
    fontWeight[`vera-${key}`] = weights[key];
  }

  return fontWeight;
}

// Run the generation
generateTailwindExtends();
