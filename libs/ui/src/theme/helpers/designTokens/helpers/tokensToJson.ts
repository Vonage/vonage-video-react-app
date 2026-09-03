import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import designTokens from '../designTokens.js';
import type { TypographyScale, VeraThemeTokens } from '@ui/theme/helpers/veraUI.types';

/**
 * Transforms design tokens into the cross-platform theme shape and writes them
 * to a JSON file.
 * @param outputDirPath - Directory to write output file
 * @param outputFileName - Name of output file
 */
export function tokensToJson(outputDirPath: string, outputFileName: string): void {
  const outputFilePath = path.resolve(outputDirPath, outputFileName);
  const themeTokens = buildThemeTokens();

  fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  fs.writeFileSync(outputFilePath, JSON.stringify(themeTokens, null, 2) + '\n', {
    flag: 'w',
  });

  console.log(`\x1b[32m✔ Design tokens JSON written to ${outputFilePath}\x1b[0m`);
}

const THEME_METADATA: VeraThemeTokens['metadata'] = {
  name: 'Vonage Video App Theme',
  version: '1.0.0',
  created: '2026-08-20',
  description:
    'Unified design tokens (colors, border radius, typography) shared across the Vonage Video Android, iOS and React apps.',
};

const TYPOGRAPHY_TOKEN_KEYS = [
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
] as const;

/**
 * Transforms the unwrapped design tokens into the unified theme shape used to
 * keep the Android, iOS and React theme documents structurally identical.
 */
function buildThemeTokens(): VeraThemeTokens {
  const unwrapped = unwrapValue(designTokens) as Record<string, unknown>;

  const colorObj = (unwrapped.color as Record<string, Record<string, string>> | undefined) ?? {};
  const light = sortColorSet(colorObj.light ?? {});
  const dark = sortColorSet(colorObj.dark ?? {});

  const border = (unwrapped.border as Record<string, string> | undefined) ?? {};
  const borderRadius = buildBorderRadius(border);

  const typography = (unwrapped.typography as Record<string, unknown> | undefined) ?? {};
  const typeface = (typography.typeface as Record<string, string> | undefined) ?? {};
  const typeScale = (typography.typeScale as Record<string, TypeScaleViewport> | undefined) ?? {};

  return {
    metadata: THEME_METADATA,
    colors: { light, dark },
    borderRadius,
    typography: {
      'font-family': typeface.plain ?? '',
      desktop: buildTypographyScale(typeScale.desktop ?? {}),
      mobile: buildTypographyScale(typeScale.mobile ?? {}),
    },
  };
}

type TypeScaleViewport = Record<string, Record<string, string | number>>;

/**
 * Returns the color set sorted alphabetically by key, keeping every semantic
 * color (including keys not present on all platforms).
 */
function sortColorSet(colorSet: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(colorSet).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Converts border radius token strings (e.g. "8px") into plain numbers without
 * a unit, as required by the theme schema.
 */
function buildBorderRadius(border: Record<string, string>): VeraThemeTokens['borderRadius'] {
  return Object.fromEntries(
    Object.entries(border).map(([key, value]) => [key, parsePxToNumber(value)])
  ) as VeraThemeTokens['borderRadius'];
}

/**
 * Builds a typography scale for one viewport, converting rem sizes to px
 * strings and font weights to integers.
 */
function buildTypographyScale(viewport: TypeScaleViewport): TypographyScale {
  return Object.fromEntries(
    TYPOGRAPHY_TOKEN_KEYS.map((tokenKey) => {
      const style = viewport[tokenKey] ?? {};
      return [
        tokenKey,
        {
          'font-size': remToPx(style.fontSize as string | undefined),
          'line-height': remToPx(style.lineHeight as string | undefined),
          'font-weight': Number(style.fontWeight),
        },
      ];
    })
  ) as TypographyScale;
}

/**
 * Converts a rem string (e.g. "1.5rem") to a px string (e.g. "24px"),
 * using the 16px = 1rem base. Returns px/other units untouched.
 */
function remToPx(value: string | undefined): string {
  if (value === undefined) return '';
  if (value.endsWith('rem')) {
    const rem = Number(value.slice(0, -3));
    return `${Math.round(rem * 16)}px`;
  }
  return value;
}

/**
 * Parses a px string (e.g. "8px") into a plain number without a unit (e.g. 8).
 */
function parsePxToNumber(value: string): number {
  return Number(value.replace('px', ''));
}

/**
 * Recursively unwraps `value` properties from token objects.
 */
function unwrapValue(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (typeof (obj as Record<string, unknown>).value !== 'undefined')
    return (obj as Record<string, unknown>).value;

  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, unwrapValue(v)])
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  tokensToJson('.', 'designTokens.example.json');
}

export default tokensToJson;
