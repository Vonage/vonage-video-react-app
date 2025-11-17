/* eslint-disable @typescript-eslint/no-use-before-define */
import * as fs from 'node:fs';
import * as path from 'node:path';
import designTokens from '../designTokens.ts';
import type { Typeface } from '../tokens/typography/typeface';
import type { TypeScale, Device } from '../tokens/typography/typescale';

const outputFile = path.resolve('frontend/src/designTokens/designTokens.json');

type FontSize = [string, { lineHeight: string; fontWeight: string }];

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
    typeface: Record<Typeface, string>;
    typeScale: Record<
      Device,
      Record<
        TypeScale,
        {
          fontSize: string;
          lineHeight: string;
          fontWeight: number;
        }
      >
    >;
    weight: Record<string, number>;
  };
};

/**
 * Converts the design tokens to tailwind format and writes them to a JSON file.
 */
function designTokensToJson() {
  // Ensure parent directory exists
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  const tokens = unwrapValue({
    ...designTokens,
    lightColor: designTokens.color.light,
    darkColor: designTokens.color.dark,
  }) as UnwrappedTokens;

  const desktopFontSize = parseResponsiveFontSize(tokens.typography.typeScale.desktop, 'desktop');
  const mobileFontSize = parseResponsiveFontSize(tokens.typography.typeScale.mobile, 'mobile');

  const tailwindExtend = {
    colors: {
      light: tokens.lightColor,
      dark: tokens.darkColor,
    },
    borderRadius: tokens.shape,
    boxShadow: tokens.elevation,
    opacity: tokens.state,
    transitionDuration: tokens.motion?.duration,
    transitionTimingFunction: tokens.motion?.easing,
    fontFamily: tokens.typography?.typeface,
    fontSize: {
      desktop: desktopFontSize,
      mobile: mobileFontSize,
    },
    fontWeight: tokens.typography?.weight,
  };

  // Write or overwrite the file
  fs.writeFileSync(outputFile, JSON.stringify(tailwindExtend, null, 2), {
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
 * Transforms responsive font size objects into Tailwind CSS fontSize format.
 * Converts each font size entry into a tuple with fontSize and associated properties.
 * @param {Record<TypeScale, any>} fontSizes - The font size objects to transform.
 * @param {Device} device - The device type (desktop or mobile).
 * @returns {Record<string, FontSize>} The transformed font sizes in Tailwind format.
 */
function parseResponsiveFontSize(
  fontSizes: Record<
    TypeScale,
    {
      fontSize: string;
      lineHeight: string;
      fontWeight: number;
    }
  >,
  device: Device
): Record<string, FontSize> {
  return Object.entries(fontSizes).reduce(
    (acc, [key, val]) => {
      // After unwrapValue, the structure is already flattened
      const { fontSize } = val;
      const { lineHeight } = val;
      const fontWeight = val.fontWeight.toString();

      const deviceKey = `${key}-${device}`;
      acc[deviceKey] = [fontSize, { lineHeight, fontWeight }];

      if (device === 'desktop') {
        acc[key] = [fontSize, { lineHeight, fontWeight }];
      }

      return acc;
    },
    {} as Record<string, FontSize>
  );
}

designTokensToJson();
