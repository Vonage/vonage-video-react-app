/**
 * State Tokens
 *
 * These tokens define the opacity levels used to represent different
 * interaction states across the interface. They help convey feedback
 * for hover, focus, pressed, and disabled states in a consistent manner.
 */
const state = {
  'hover-opacity': {
    value: '0.08',
    type: 'opacity',
    description: 'Used to indicate hover state on interactive elements.',
  },
  'focus-opacity': {
    value: '0.12',
    type: 'opacity',
    description: 'Used to indicate focus state on interactive elements.',
  },
  'pressed-opacity': {
    value: '0.16',
    type: 'opacity',
    description: 'Used to indicate pressed state on interactive elements.',
  },
  'disabled-opacity': {
    value: '0.38',
    type: 'opacity',
    description: 'Used to indicate that an element is disabled or inactive.',
  },
};

export default state;
