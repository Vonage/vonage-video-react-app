/**
 * Duration Design Tokens
 *
 * This module defines standardized duration tokens for motion
 * within the user interface, ensuring consistent timing
 * for animations and transitions.
 */
const durations = {
  instant: {
    value: '50ms',
    description: 'Used for immediate feedback like hover states or quick visual changes',
  },
  quick: {
    value: '100ms',
    description: 'Used for fast interactions such as button presses or quick toggles',
  },
  short: {
    value: '150ms',
    description: 'Used for small UI elements like tooltips or dropdowns',
  },
  medium: {
    value: '200ms',
    description: 'Used for medium UI elements like cards or notifications',
  },
  long: {
    value: '300ms',
    description: 'Used for larger UI elements like modals or side panels',
  },
  extraLong: {
    value: '500ms',
    description: 'Used for complex animations like page transitions or full-screen overlays',
  },
};

export default durations;
