import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import designTokens from '../designTokens.js';
import type { VeraUIConfig } from '@ui/theme/helpers/veraUI.types';

/**
 * Transforms design tokens into VeraUIConfig shape and writes to JSON file.
 * @param outputDirPath - Directory to write output file
 * @param outputFileName - Name of output file
 */
export function tokensToJson(outputDirPath: string, outputFileName: string): void {
  const outputFilePath = path.resolve(outputDirPath, outputFileName);
  const veraConfig = buildVeraUIConfig();

  fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  fs.writeFileSync(outputFilePath, JSON.stringify(veraConfig, null, 2) + '\n', { flag: 'w' });

  console.log(`\x1b[32m✔ Design tokens JSON written to ${outputFilePath}\x1b[0m`);
}

/**
 * Transforms unwrapped design tokens into VeraUIConfig shape.
 */
function buildVeraUIConfig(): VeraUIConfig {
  const unwrapped = unwrapValue(designTokens) as Record<string, unknown>;

  const kebabToCamelCase = (str: string): string =>
    str.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

  // Light colors
  const colorObj = unwrapped.color as Record<string, Record<string, string>> | undefined;
  const lightColor = colorObj?.light ?? {};

  const light = Object.fromEntries(
    Object.entries(lightColor)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [kebabToCamelCase(k), v])
  );

  // Dark colors
  const darkColor = colorObj?.dark ?? {};

  const dark = Object.fromEntries(
    Object.entries(darkColor)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [kebabToCamelCase(k), v])
  );

  // Border radius
  const border = (unwrapped.border as Record<string, string> | undefined) ?? {};
  const borderRadiusConfig = Object.fromEntries(
    Object.entries(border)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [`borderRadius${kebabToCamelCase(`-${k}`)}`, v])
  );

  // Font family
  const typography = (unwrapped.typography as Record<string, unknown> | undefined) ?? {};
  const typeface = (typography.typeface as Record<string, string> | undefined) ?? {};

  const fontFamilyConfig = Object.fromEntries(
    Object.entries(typeface)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [`fontFamily${kebabToCamelCase(`-${k}`)}`, v])
  );

  // Typography
  const typeScaleObj = typography.typeScale as
    | Record<string, Record<string, Record<string, unknown>>>
    | undefined;
  const typeScale = typeScaleObj ?? {};
  const desktop = (typeScale.desktop as Record<string, Record<string, unknown>> | undefined) ?? {};
  const mobile = (typeScale.mobile as Record<string, Record<string, unknown>> | undefined) ?? {};

  const typographyKeysByConfig = {
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

  const typographyConfig = Object.fromEntries(
    Object.entries(typographyKeysByConfig).map(([configKey, tokenKey]) => {
      const dtObj = desktop[tokenKey] ?? {};
      const mtObj = mobile[tokenKey] ?? {};

      const fontSize = dtObj.fontSize as string | undefined;
      const lineHeight = dtObj.lineHeight as string | undefined;
      const fontWeight = dtObj.fontWeight as string | number | undefined;
      const mobileFontSize = mtObj.fontSize as string | undefined;
      const mobileLineHeight = mtObj.lineHeight as string | undefined;
      const mobileFontWeight = mtObj.fontWeight as string | number | undefined;

      return [
        configKey,
        {
          ...(fontSize !== undefined ? { fontSize } : {}),
          ...(lineHeight !== undefined ? { lineHeight } : {}),
          ...(fontWeight !== undefined ? { fontWeight: String(fontWeight) } : {}),
          ...(mobileFontSize !== undefined ? { mobileFontSize } : {}),
          ...(mobileLineHeight !== undefined ? { mobileLineHeight } : {}),
          ...(mobileFontWeight !== undefined ? { mobileFontWeight: String(mobileFontWeight) } : {}),
        },
      ];
    })
  );

  return {
    light: light as VeraUIConfig['light'],
    dark: dark as VeraUIConfig['dark'],
    ...borderRadiusConfig,
    ...fontFamilyConfig,
    ...typographyConfig,
  } as VeraUIConfig;
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
