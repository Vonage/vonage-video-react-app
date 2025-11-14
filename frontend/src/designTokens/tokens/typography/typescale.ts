/**
 * Typography Type Scale Design Tokens
 *
 * This module defines a comprehensive type scale for typography,
 * specifying font sizes, line heights, and font weights for various
 * text elements such as headlines, subtitles, headings, body text, and captions.
 * Each token includes responsive variants for desktop and mobile devices.
 */

// Helper function to convert px to rem (16px = 1rem)
const pxToRem = (px: number) => `${px / 16}rem`;

const typeScale = {
  desktop: {
    headline: {
      fontSize: { value: pxToRem(66), description: 'Equivalent to 66px' },
      lineHeight: { value: pxToRem(88), description: 'Equivalent to 88px' },
      fontWeight: { value: 500, description: 'Medium weight for headline desktop' },
    },
    subtitle: {
      fontSize: { value: pxToRem(52), description: 'Equivalent to 52px' },
      lineHeight: { value: pxToRem(68), description: 'Equivalent to 68px' },
      fontWeight: { value: 500, description: 'Medium weight for subtitle desktop' },
    },
    'heading-1': {
      fontSize: { value: pxToRem(40), description: 'Equivalent to 40px' },
      lineHeight: { value: pxToRem(52), description: 'Equivalent to 52px' },
      fontWeight: { value: 500, description: 'Medium weight for heading 1 desktop' },
    },
    'heading-2': {
      fontSize: { value: pxToRem(32), description: 'Equivalent to 32px' },
      lineHeight: { value: pxToRem(44), description: 'Equivalent to 44px' },
      fontWeight: { value: 500, description: 'Medium weight for heading 2 desktop' },
    },
    'heading-3': {
      fontSize: { value: pxToRem(26), description: 'Equivalent to 26px' },
      lineHeight: { value: pxToRem(36), description: 'Equivalent to 36px' },
      fontWeight: { value: 500, description: 'Medium weight for heading 3 desktop' },
    },
    'heading-4': {
      fontSize: { value: pxToRem(20), description: 'Equivalent to 20px' },
      lineHeight: { value: pxToRem(28), description: 'Equivalent to 28px' },
      fontWeight: { value: 500, description: 'Medium weight for heading 4 desktop' },
    },
    'body-extended': {
      fontSize: { value: pxToRem(16), description: 'Equivalent to 16px' },
      lineHeight: { value: pxToRem(24), description: 'Equivalent to 24px' },
      fontWeight: { value: 400, description: 'Regular weight for extended body desktop' },
    },
    'body-extended-semibold': {
      fontSize: { value: pxToRem(16), description: 'Equivalent to 16px' },
      lineHeight: { value: pxToRem(24), description: 'Equivalent to 24px' },
      fontWeight: { value: 600, description: 'Semibold weight for extended body desktop' },
    },
    'body-base': {
      fontSize: { value: pxToRem(14), description: 'Equivalent to 14px' },
      lineHeight: { value: pxToRem(20), description: 'Equivalent to 20px' },
      fontWeight: { value: 400, description: 'Regular weight for base body desktop' },
    },
    'body-base-semibold': {
      fontSize: { value: pxToRem(14), description: 'Equivalent to 14px' },
      lineHeight: { value: pxToRem(20), description: 'Equivalent to 20px' },
      fontWeight: { value: 600, description: 'Semibold weight for base body desktop' },
    },
    caption: {
      fontSize: { value: pxToRem(12), description: 'Equivalent to 12px' },
      lineHeight: { value: pxToRem(16), description: 'Equivalent to 16px' },
      fontWeight: { value: 400, description: 'Regular weight for caption desktop' },
    },
    'caption-semibold': {
      fontSize: { value: pxToRem(12), description: 'Equivalent to 12px' },
      lineHeight: { value: pxToRem(16), description: 'Equivalent to 16px' },
      fontWeight: { value: 600, description: 'Semibold weight for caption desktop' },
    },
  },

  mobile: {
    headline: {
      fontSize: { value: pxToRem(32), description: 'Equivalent to 32px' },
      lineHeight: { value: pxToRem(40), description: 'Equivalent to 40px' },
      fontWeight: { value: 500, description: 'Medium weight for headline mobile' },
    },
    subtitle: {
      fontSize: { value: pxToRem(18), description: 'Equivalent to 18px' },
      lineHeight: { value: pxToRem(24), description: 'Equivalent to 24px' },
      fontWeight: { value: 500, description: 'Medium weight for subtitle mobile' },
    },
    'heading-1': {
      fontSize: { value: pxToRem(28), description: 'Equivalent to 28px' },
      lineHeight: { value: pxToRem(36), description: 'Equivalent to 36px' },
      fontWeight: { value: 500, description: 'Medium weight for heading 1 mobile' },
    },
    'heading-2': {
      fontSize: { value: pxToRem(24), description: 'Equivalent to 24px' },
      lineHeight: { value: pxToRem(32), description: 'Equivalent to 32px' },
      fontWeight: { value: 500, description: 'Medium weight for heading 2 mobile' },
    },
    'heading-3': {
      fontSize: { value: pxToRem(20), description: 'Equivalent to 20px' },
      lineHeight: { value: pxToRem(28), description: 'Equivalent to 28px' },
      fontWeight: { value: 500, description: 'Medium weight for heading 3 mobile' },
    },
    'heading-4': {
      fontSize: { value: pxToRem(18), description: 'Equivalent to 18px' },
      lineHeight: { value: pxToRem(24), description: 'Equivalent to 24px' },
      fontWeight: { value: 500, description: 'Medium weight for heading 4 mobile' },
    },
    'body-extended': {
      fontSize: { value: pxToRem(16), description: 'Equivalent to 16px' },
      lineHeight: { value: pxToRem(24), description: 'Equivalent to 24px' },
      fontWeight: { value: 400, description: 'Regular weight for extended body mobile' },
    },
    'body-extended-semibold': {
      fontSize: { value: pxToRem(16), description: 'Equivalent to 16px' },
      lineHeight: { value: pxToRem(24), description: 'Equivalent to 24px' },
      fontWeight: { value: 600, description: 'Semibold weight for extended body mobile' },
    },
    'body-base': {
      fontSize: { value: pxToRem(14), description: 'Equivalent to 14px' },
      lineHeight: { value: pxToRem(20), description: 'Equivalent to 20px' },
      fontWeight: { value: 400, description: 'Regular weight for base body mobile' },
    },
    'body-base-semibold': {
      fontSize: { value: pxToRem(14), description: 'Equivalent to 14px' },
      lineHeight: { value: pxToRem(20), description: 'Equivalent to 20px' },
      fontWeight: { value: 600, description: 'Semibold weight for base body mobile' },
    },
    caption: {
      fontSize: { value: pxToRem(12), description: 'Equivalent to 12px' },
      lineHeight: { value: pxToRem(16), description: 'Equivalent to 16px' },
      fontWeight: { value: 400, description: 'Regular weight for caption mobile' },
    },
    'caption-semibold': {
      fontSize: { value: pxToRem(12), description: 'Equivalent to 12px' },
      lineHeight: { value: pxToRem(16), description: 'Equivalent to 16px' },
      fontWeight: { value: 600, description: 'Semibold weight for caption mobile' },
    },
  },
};

// Updated types to match the new structure
export type Device = keyof typeof typeScale;
export type TypeScale = keyof typeof typeScale.desktop; // Both desktop and mobile have same keys

export type TypeScaleProps = {
  fontSize: { value: string; description: string };
  lineHeight: { value: string; description: string };
  fontWeight: { value: number; description: string };
};

export type TypeScaleStructure = Record<Device, Record<TypeScale, TypeScaleProps>>;

export default typeScale as TypeScaleStructure;
