import tailwindExtends from './tailwindExtends.json';
import { CustomThemeConfig } from 'tailwindcss/types/config';

/**
 * Shared Tailwind theme extensions for Vera UI design system.
 * Import and spread this into your tailwind.config.ts theme.extend section.
 *
 * This file is auto-generated from design tokens.
 * Run `npm run generate:tokens` to regenerate.
 *
 * @example
 * ```ts
 * import veraUIExtensions from '@ui/theme/helpers/tailwind';
 *
 * export default {
 *   theme: {
 *     extend: {
 *       ...veraUIExtensions,
 *     }
 *   }
 * }
 * ```
 */
// @ts-expect-error TS Is not able to infer the type from the JSON import
const veraUIExtensions = tailwindExtends as Partial<CustomThemeConfig>;

export default veraUIExtensions;
