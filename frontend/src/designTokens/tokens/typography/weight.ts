/**
 * Typography Weight Design Tokens
 *
 * These tokens define the standard font weights used throughout
 * the user interface. They provide a consistent typographic
 * hierarchy by specifying regular, medium, and bold weights
 * for various text elements.
 */
const weight = {
  'weight-regular': {
    value: 400,
    type: 'fontWeight',
    description: 'Regular weight used for body text and general content.',
  },

  'weight-medium': {
    value: 500,
    type: 'fontWeight',
    description: 'Medium weight used for labels, subheadings, and emphasis.',
  },

  'weight-bold': {
    value: 700,
    type: 'fontWeight',
    description: 'Bold weight used for headings and important text elements.',
  },
};

export type Weight = keyof typeof weight;

export type WeightProps = {
  value: string | number;
  type: 'fontWeight';
  description: string;
};

export default weight as Record<Weight, WeightProps>;
