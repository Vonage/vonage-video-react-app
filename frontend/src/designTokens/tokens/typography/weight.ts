/**
 * Typography Weight Design Tokens
 *
 * These tokens define the standard font weights used throughout
 * the user interface. They provide a consistent typographic
 * hierarchy by specifying regular, medium, and bold weights
 * for various text elements.
 */
const weight = {
  headline: {
    value: 500,
    type: 'fontWeight',
    description: 'Font weight for headline text',
  },

  subtitle: {
    value: 500,
    type: 'fontWeight',
    description: 'Font weight for subtitle text',
  },

  'heading-1': {
    value: 500,
    type: 'fontWeight',
    description: 'Font weight for heading level 1',
  },

  'heading-2': {
    value: 500,
    type: 'fontWeight',
    description: 'Font weight for heading level 2',
  },

  'heading-3': {
    value: 500,
    type: 'fontWeight',
    description: 'Font weight for heading level 3',
  },

  'heading-4': {
    value: 500,
    type: 'fontWeight',
    description: 'Font weight for heading level 4',
  },

  'body-extended': {
    value: 400,
    type: 'fontWeight',
    description: 'Font weight for extended body text',
  },

  'body-extended-semibold': {
    value: 600,
    type: 'fontWeight',
    description: 'Semibold font weight for extended body text',
  },

  'body-base': {
    value: 400,
    type: 'fontWeight',
    description: 'Font weight for base body text',
  },

  'body-base-semibold': {
    value: 600,
    type: 'fontWeight',
    description: 'Semibold font weight for base body text',
  },

  caption: {
    value: 400,
    type: 'fontWeight',
    description: 'Font weight for caption text',
  },

  'caption-semibold': {
    value: 600,
    type: 'fontWeight',
    description: 'Semibold font weight for caption text',
  },
};

export type Weight = keyof typeof weight;

export type WeightProps = {
  value: string | number;
  type: 'fontWeight';
  description: string;
};

export default weight as Record<Weight, WeightProps>;
