/**
 * Shape Tokens
 *
 * These tokens define the corner radius values used throughout the design system.
 * They provide a consistent approach to rounding corners on various UI components,
 * enhancing the overall visual coherence and user experience.
 */
const shape = {
  none: {
    value: '0px',
    type: 'radius',
    description: 'No rounding; sharp corners.',
  },
  'extra-small': {
    value: '2px',
    type: 'radius',
    description: 'Minimal rounding for very subtle corner softening.',
  },
  small: {
    value: '4px',
    type: 'radius',
    description: 'Small corner radius for buttons and small components.',
  },
  medium: {
    value: '8px',
    type: 'radius',
    description: 'Default rounding for most UI elements.',
  },
  large: {
    value: '12px',
    type: 'radius',
    description: 'Larger rounding for cards and containers.',
  },
  'extra-large': {
    value: '24px',
    type: 'radius',
    description: 'Significant rounding for prominent elements or modals.',
  },
};

export default shape;
