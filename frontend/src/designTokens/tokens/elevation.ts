/**
 * Elevation Tokens
 *
 * These tokens define the shadow styles used to represent different levels of elevation
 * in the design system. They help create a sense of depth and hierarchy among UI components.
 */
const elevation = {
  level0: {
    value: 'none',
    type: 'shadow',
    description: 'No elevation; flat surface.',
  },
  level1: {
    value: '0 1px 2px rgba(0,0,0,0.1)',
    type: 'shadow',
    description: 'Very low elevation for subtle depth effects.',
  },
  level2: {
    value: '0 2px 4px rgba(0,0,0,0.12)',
    type: 'shadow',
    description: 'Low elevation for cards and raised elements.',
  },
  level3: {
    value: '0 4px 6px rgba(0,0,0,0.14)',
    type: 'shadow',
    description: 'Moderate elevation for prominent components.',
  },
  level4: {
    value: '0 8px 12px rgba(0,0,0,0.16)',
    type: 'shadow',
    description: 'High elevation for floating elements.',
  },
  level5: {
    value: '0 12px 16px rgba(0,0,0,0.18)',
    type: 'shadow',
    description: 'Very high elevation for modal dialogs and overlays.',
  },
};

export default elevation;
