/* eslint-disable @typescript-eslint/no-use-before-define */
import * as fs from 'node:fs';
import * as path from 'node:path';
import designTokens from '../designTokens';
import type { Typeface } from '../tokens/typography/typeface';
import type { TypeScale } from '../tokens/typography/typescale';

const outputFile = path.resolve('frontend/src/designTokens/designTokens.json');

type FontSize = [string, { lineHeight: string; fontWeight: string }];

type UnwrappedTokens = {
  color: Record<string, string>;
  shape: Record<string, string>;
  elevation: Record<string, string>;
  state: Record<string, string>;
  motion: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
  typography: {
    typeface: Record<
      Typeface,
      {
        value: string;
      }
    >;
    typeScale: Record<
      TypeScale,
      {
        fontSize: string;
        lineHeight: string;
        fontWeight: string;
      }
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

  const tokens = unwrapValue(designTokens) as UnwrappedTokens;

  const fontSize = parseFontSize(tokens.typography.typeScale);

  const tailwindExtend = {
    colors: tokens.color,
    borderRadius: tokens.shape,
    boxShadow: tokens.elevation,
    opacity: tokens.state,
    transitionDuration: tokens.motion?.duration,
    transitionTimingFunction: tokens.motion?.easing,
    fontFamily: tokens.typography?.typeface,
    fontSize,
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

  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, unwrapValue(value)]));
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
 * Type guard to check if a value is a Record<string, unknown>.
 * @param {unknown} fontSizes - The value to check.
 * @returns {boolean} True if the value is a Record<string, unknown>, false otherwise.
 */
function parseFontSize(
  fontSizes: Record<TypeScale, { fontSize: string; lineHeight: string; fontWeight: string }>
): Record<string, FontSize> {
  return Object.entries(fontSizes).reduce(
    (acc, [key, val]) => {
      const { fontSize, lineHeight, fontWeight } = val;
      acc[key] = [fontSize, { lineHeight, fontWeight }];
      return acc;
    },
    {} as Record<string, FontSize>
  );
}

designTokensToJson();
