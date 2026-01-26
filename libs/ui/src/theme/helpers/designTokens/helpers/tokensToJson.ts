import * as fs from 'node:fs';
import * as path from 'node:path';
import designTokens from '../designTokens.js';
import type { Device, ThemeTypeface, ThemeTypeScale, ThemeWeight } from '@ui/theme';

const outputFile = path.resolve('libs/ui/src/theme/helpers/designTokens/designTokens.json');

type FontSize = {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
};

type UnwrappedTokens = {
  lightColor: Record<string, string>;
  darkColor: Record<string, string>;
  shape: Record<string, string>;
  elevation: Record<string, string>;
  state: Record<string, string>;
  motion: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
  typography: {
    typeface: Record<ThemeTypeface, string>;
    weight: Record<ThemeWeight, string>;
    typeScale: Record<
      Device,
      Record<
        ThemeTypeScale,
        {
          fontSize: string;
          lineHeight: string;
          fontWeight: number;
        }
      >
    >;
  };
};

/**
 * Converts the design tokens to tailwind format and writes them to a JSON file.
 */
function designTokensToJson() {
  // Ensure parent directory exists
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  const unwrappedTokens = unwrapValue({
    ...designTokens,
    lightColor: designTokens.color.light,
    darkColor: designTokens.color.dark,
  }) as UnwrappedTokens;

  const desktopFontSize = parseResponsiveFontSize(unwrappedTokens.typography.typeScale.desktop);
  const mobileFontSize = parseResponsiveFontSize(unwrappedTokens.typography.typeScale.mobile);

  const tailwindExtend = {
    colors: {
      light: unwrappedTokens.lightColor,
      dark: unwrappedTokens.darkColor,
    },
    borderRadius: unwrappedTokens.shape,
    boxShadow: unwrappedTokens.elevation,
    opacity: unwrappedTokens.state,
    transitionDuration: unwrappedTokens.motion?.duration,
    transitionTimingFunction: unwrappedTokens.motion?.easing,
    fontFamily: unwrappedTokens.typography?.typeface,
    fontSize: {
      desktop: desktopFontSize,
      mobile: mobileFontSize,
    },
    fontWeight: unwrappedTokens.typography?.weight,
  };

  // Write or overwrite the file
  fs.writeFileSync(outputFile, JSON.stringify(tailwindExtend, null, 2) + '\n', {
    flag: 'w',
  });

  console.log(`\x1b[32m✔ Design tokens JSON written to ${outputFile}\x1b[0m`);
}

/**
 * Recursively unwraps the `value` properties from the design tokens.
 * @param {unknown} obj - The object to unwrap.
 * @returns {unknown} The unwrapped object.
 */
function unwrapValue(obj: unknown): unknown {
  if (!isRecord(obj)) {
    return obj;
  }
  if (!isUndefined(obj.value)) {
    return obj.value;
  }

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, unwrapValue(value)])
  );
}

/**
 * Type guard to check if a value is a Record<string, unknown>.
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is a Record<string, unknown>, false otherwise.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if a value is undefined.
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is undefined, false otherwise.
 */
function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

/**
 * Transforms responsive font size objects into the desired format.
 * @param {Record<TypeScale, any>} fontSizes - The font size objects to transform.
 * @returns {Record<string, FontSize>} The transformed font sizes.
 */
function parseResponsiveFontSize(
  fontSizes: Record<
    ThemeTypeScale,
    {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
    }
  >
): Record<string, FontSize> {
  return Object.entries(fontSizes).reduce(
    (acc, [key, val]) => {
      acc[key] = {
        fontSize: val.fontSize,
        lineHeight: val.lineHeight,
        fontWeight: val.fontWeight.toString(),
      };
      return acc;
    },
    {} as Record<string, FontSize>
  );
}

designTokensToJson();
