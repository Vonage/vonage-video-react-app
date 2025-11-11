/**
 * Typography Weight Design Tokens
 *
 * These tokens define the standard font weights used throughout
 * the user interface. They provide a consistent typographic
 * hierarchy by specifying regular, medium, and bold weights
 * for various text elements.
 */
const weight = {
  'headline-1': {
    value: 400,
    type: 'fontWeight',
    description: '',
  },

  'headline-2': {
    value: 400,
    type: 'fontWeight',
    description: '',
  },

  heading: {
    value: 500,
    type: 'fontWeight',
    description: '',
  },

  'body-1': {
    value: 400,
    type: 'fontWeight',
    description: '',
  },

  'body-1-semibold': {
    value: 600,
    type: 'fontWeight',
    description: '',
  },

  'body-2': {
    value: 400,
    type: 'fontWeight',
    description: '',
  },
};

export type Weight = keyof typeof weight;

export type WeightProps = {
  value: string | number;
  type: 'fontWeight';
  description: string;
};

export default weight as Record<Weight, WeightProps>;
