/**
 * Motion Easing Tokens
 *
 * These tokens define the standard timing functions (easing curves)
 * used to control the acceleration and deceleration of animations.
 * Easing shapes the way elements move — giving interactions a sense
 * of realism, weight, and responsiveness.
 */
const easing = {
  standard: {
    value: 'cubic-bezier(0.2, 0, 0, 1)',
    description: 'Smooth and balanced easing — suitable for most UI animations and transitions.',
  },
  accelerate: {
    value: 'cubic-bezier(0.3, 0, 1, 1)',
    description: 'Starts slow and speeds up — ideal for exiting or disappearing elements.',
  },
  decelerate: {
    value: 'cubic-bezier(0, 0, 0.3, 1)',
    description: 'Starts fast and slows down — perfect for entering or appearing elements.',
  },
  linear: {
    value: 'linear',
    description:
      'Constant speed from start to finish — useful for continuous or looping animations.',
  },
};

export default easing;
