/**
 * Typography Type Scale Design Tokens
 *
 * This module defines a comprehensive type scale for typography,
 * specifying font sizes, line heights, and font weights for various
 * text elements such as labels, body text, titles, headlines, and display text.
 * Each token includes a description to clarify its intended use.
 */
const typeScale = {
  'label-small': {
    fontSize: { value: '0.6875rem', description: 'Equivalent to 11px' },
    lineHeight: { value: '1rem', description: 'Equivalent to 16px' },
    fontWeight: { value: 500, description: 'Medium weight for small labels' },
  },

  'label-medium': {
    fontSize: { value: '0.75rem', description: 'Equivalent to 12px' },
    lineHeight: { value: '1rem', description: 'Equivalent to 16px' },
    fontWeight: { value: 500, description: 'Medium weight for medium labels' },
  },

  'label-large': {
    fontSize: { value: '0.875rem', description: 'Equivalent to 14px' },
    lineHeight: { value: '1.25rem', description: 'Equivalent to 20px' },
    fontWeight: { value: 500, description: 'Medium weight for large labels' },
  },

  'body-small': {
    fontSize: { value: '0.75rem', description: 'Equivalent to 12px' },
    lineHeight: { value: '1rem', description: 'Equivalent to 16px' },
    fontWeight: {
      value: 400,
      description: 'Regular weight for small body text',
    },
  },

  'body-medium': {
    fontSize: { value: '0.875rem', description: 'Equivalent to 14px' },
    lineHeight: { value: '1.25rem', description: 'Equivalent to 20px' },
    fontWeight: {
      value: 400,
      description: 'Regular weight for medium body text',
    },
  },

  'body-large': {
    fontSize: { value: '1rem', description: 'Equivalent to 16px' },
    lineHeight: { value: '1.5rem', description: 'Equivalent to 24px' },
    fontWeight: {
      value: 400,
      description: 'Regular weight for large body text',
    },
  },

  'title-small': {
    fontSize: { value: '0.875rem', description: 'Equivalent to 14px' },
    lineHeight: { value: '1.25rem', description: 'Equivalent to 20px' },
    fontWeight: { value: 500, description: 'Medium weight for small titles' },
  },

  'title-medium': {
    fontSize: { value: '1rem', description: 'Equivalent to 16px' },
    lineHeight: { value: '1.5rem', description: 'Equivalent to 24px' },
    fontWeight: { value: 500, description: 'Medium weight for medium titles' },
  },

  'title-large': {
    fontSize: { value: '1.375rem', description: 'Equivalent to ~22px' },
    lineHeight: { value: '1.75rem', description: 'Equivalent to 28px' },
    fontWeight: { value: 400, description: 'Regular weight for large titles' },
  },

  'headline-small': {
    fontSize: { value: '1.5rem', description: 'Equivalent to 24px' },
    lineHeight: { value: '2rem', description: 'Equivalent to 32px' },
    fontWeight: {
      value: 400,
      description: 'Regular weight for small headlines',
    },
  },

  'headline-medium': {
    fontSize: { value: '1.75rem', description: 'Equivalent to 28px' },
    lineHeight: { value: '2.25rem', description: 'Equivalent to 36px' },
    fontWeight: {
      value: 400,
      description: 'Regular weight for medium headlines',
    },
  },

  'headline-large': {
    fontSize: { value: '2rem', description: 'Equivalent to 32px' },
    lineHeight: { value: '2.5rem', description: 'Equivalent to 40px' },
    fontWeight: {
      value: 400,
      description: 'Regular weight for large headlines',
    },
  },

  'display-small': {
    fontSize: { value: '2.25rem', description: 'Equivalent to 36px' },
    lineHeight: { value: '2.75rem', description: 'Equivalent to 44px' },
    fontWeight: {
      value: 400,
      description: 'Regular weight for small display text',
    },
  },

  'display-medium': {
    fontSize: { value: '2.8125rem', description: 'Equivalent to 45px' },
    lineHeight: { value: '3.25rem', description: 'Equivalent to 52px' },
    fontWeight: {
      value: 400,
      description: 'Regular weight for medium display text',
    },
  },

  'display-large': {
    fontSize: { value: '3.5625rem', description: 'Equivalent to 57px' },
    lineHeight: { value: '4rem', description: 'Equivalent to 64px' },
    fontWeight: {
      value: 400,
      description: 'Regular weight for large display text',
    },
  },
};

export type TypeScale = keyof typeof typeScale;

export type TypeScaleProps = {
  fontSize: { value: string; description: string };
  lineHeight: { value: string; description: string };
  fontWeight: { value: number; description: string };
};

export default typeScale as Record<TypeScale, TypeScaleProps>;
