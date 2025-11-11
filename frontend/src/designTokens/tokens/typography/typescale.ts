/**
 * Typography Type Scale Design Tokens
 *
 * This module defines a comprehensive type scale for typography,
 * specifying font sizes, line heights, and font weights for various
 * text elements such as labels, body text, titles, headlines, and display text.
 * Each token includes a description to clarify its intended use.
 */
const typeScale = {
  'headline-1-desktop': {
    fontSize: { value: '4.125rem', description: 'Equivalent to 66px' },
    lineHeight: { value: '5.5rem', description: 'Equivalent to 88px' },
    fontWeight: { value: 400, description: 'Regular weight for headlines' },
  },
  'headline-1-mobile': {
    fontSize: { value: '2rem', description: 'Equivalent to 32px' },
    lineHeight: { value: '2.25rem', description: 'Equivalent to 36px' },
    fontWeight: { value: 400, description: 'Regular weight for headlines mobile' },
  },

  'headline-2-desktop': {
    fontSize: { value: '2rem', description: 'Equivalent to 32px' },
    lineHeight: { value: '3rem', description: 'Equivalent to 48px' },
    fontWeight: { value: 400, description: 'Regular weight for headlines' },
  },
  'headline-2-mobile': {
    fontSize: { value: '1rem', description: 'Equivalent to 16px' },
    lineHeight: { value: '1.5rem', description: 'Equivalent to 24px' },
    fontWeight: { value: 400, description: 'Regular weight for headlines mobile' },
  },

  'heading-desktop': {
    fontSize: { value: '1.25rem', description: 'Equivalent to 20px' },
    lineHeight: { value: '1.75rem', description: 'Equivalent to 28px' },
    fontWeight: { value: 500, description: 'Medium weight for heading' },
  },
  'heading-mobile': {
    fontSize: { value: '0.75rem', description: 'Equivalent to 12px' },
    lineHeight: { value: '0.95rem', description: 'Equivalent to 15px' },
    fontWeight: { value: 500, description: 'Medium weight for heading mobile' },
  },

  'body-1': {
    fontSize: { value: '1rem', description: 'Equivalent to 16px' },
    lineHeight: { value: '1.5rem', description: 'Equivalent to 24px' },
    fontWeight: { value: 400, description: 'Regular weight for body text' },
  },
  'body-2': {
    fontSize: { value: '0.875rem', description: 'Equivalent to 14px' },
    lineHeight: { value: '1.25rem', description: 'Equivalent to 20px' },
    fontWeight: { value: 400, description: 'Regular weight for medium body text' },
  },
  'body-3': {
    fontSize: { value: '0.75rem', description: 'Equivalent to 12px' },
    lineHeight: { value: '1rem', description: 'Equivalent to 16px' },
    fontWeight: { value: 400, description: 'Regular weight for small body text' },
  },
};

export type TypeScale = keyof typeof typeScale;

export type TypeScaleProps = {
  fontSize: { value: string; description: string };
  lineHeight: { value: string; description: string };
  fontWeight: { value: number; description: string };
};

export default typeScale as Record<TypeScale, TypeScaleProps>;
