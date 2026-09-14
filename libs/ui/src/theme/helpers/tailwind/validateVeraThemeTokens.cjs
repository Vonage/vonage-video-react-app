/**
 * Runtime Zod validation for the Vera design tokens document.
 *
 * The Tailwind configs (CommonJS files) require this validator to fail fast
 * when designTokens.json drifts from the standardized VeraThemeTokens shape,
 * instead of silently generating a broken theme. Kept as a .cjs sibling of
 * veraUI.cjs so it stays requireable from the tailwind.config.cjs files.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { z } = require('zod');

const HEX_COLOR = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

const COLOR_TOKEN_KEYS = [
  'accent',
  'alert-background',
  'alert-background-hover',
  'alert-text',
  'background',
  'border',
  'dark-background',
  'dark-grey',
  'dark-grey-hover',
  'dark-grey-opacity',
  'disabled',
  'error',
  'error-hover',
  'information',
  'information-background',
  'information-hover',
  'on-accent',
  'on-background',
  'on-dark-grey',
  'on-error',
  'on-information',
  'on-primary',
  'on-secondary',
  'on-success',
  'on-surface',
  'on-tertiary',
  'on-warning',
  'primary',
  'primary-hover',
  'secondary',
  'secondary-hover',
  'skeleton-like',
  'success',
  'success-hover',
  'surface',
  'tertiary',
  'tertiary-hover',
  'text-disabled',
  'text-primary',
  'text-secondary',
  'text-tertiary',
  'warning',
  'warning-hover',
];

const hexColorSchema = z.string().regex(HEX_COLOR, 'Invalid hex color');

// Strict object keyed by the exact known color tokens: a renamed, missing or
// unknown token (e.g. "dark2-grey" instead of "dark-grey") fails validation
// instead of silently falling back to the plugin's baked-in default.
const colorPaletteSchema = z
  .object(Object.fromEntries(COLOR_TOKEN_KEYS.map((key) => [key, hexColorSchema])))
  .strict();

const typographyStyleSchema = z.object({
  'font-size': z.string(),
  'line-height': z.string(),
  'font-weight': z.number(),
});

const typographyScaleSchema = z.object({
  headline: typographyStyleSchema,
  subtitle: typographyStyleSchema,
  'heading-1': typographyStyleSchema,
  'heading-2': typographyStyleSchema,
  'heading-3': typographyStyleSchema,
  'heading-4': typographyStyleSchema,
  'body-extended': typographyStyleSchema,
  'body-extended-semibold': typographyStyleSchema,
  'body-base': typographyStyleSchema,
  'body-base-semibold': typographyStyleSchema,
  caption: typographyStyleSchema,
  'caption-semibold': typographyStyleSchema,
});

const veraThemeTokensSchema = z.object({
  metadata: z.object({
    name: z.string(),
    version: z.string(),
    created: z.string(),
    description: z.string(),
  }),
  colors: z.object({
    light: colorPaletteSchema,
    dark: colorPaletteSchema,
  }),
  borderRadius: z.object({
    none: z.number(),
    'extra-small': z.number(),
    small: z.number(),
    medium: z.number(),
    large: z.number(),
    'extra-large': z.number(),
  }),
  typography: z.object({
    'font-family': z.string(),
    desktop: typographyScaleSchema,
    mobile: typographyScaleSchema,
  }),
});

/**
 * Parses the given design tokens document, throwing a descriptive error when it
 * does not match the VeraThemeTokens shape. Returns the validated document so it
 * can be passed straight into veraUI().
 */
const validateVeraThemeTokens = (tokens) => {
  const result = veraThemeTokensSchema.safeParse(tokens);

  if (!result.success) {
    throw new Error(`Invalid Vera design tokens:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
};

module.exports = validateVeraThemeTokens;
