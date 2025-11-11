/**
 * Color Tokens
 *
 * These tokens define the core color system used throughout the interface.
 * Each token represents a semantic purpose — rather than a specific hex value —
 * allowing color changes to propagate consistently across the design system.
 */
const colors = {
  primary: {
    value: '#9941FF',
    type: 'color',
    description: 'Main brand color used for primary actions and highlights.',
  },
  'text-primary': {
    value: '#9941FF',
    type: 'color',
    description: 'Primary text color used for main content and headings.',
  },
  'on-primary': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color used on primary surfaces.',
  },
  'primary-hover': {
    value: '#871EFF',
    type: 'color',
    description: 'Main brand color for hovering.',
  },

  secondary: {
    value: '#000000',
    type: 'color',
    description: 'Secondary brand color and accent.',
  },
  'text-secondary': {
    value: '#000000',
    type: 'color',
    description: 'Secondary text color used for subheadings and less prominent content.',
  },
  'on-secondary': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color used on secondary surfaces.',
  },

  tertiary: {
    value: '#929292',
    type: 'color',
    description: 'Tertiary brand color and accent.',
  },
  'text-tertiary': {
    value: '#929292',
    type: 'color',
    description: 'Tertiary text color used for less prominent content.',
  },
  'on-tertiary': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color used on tertiary surfaces.',
  },

  background: {
    value: '#F5F0FD',
    type: 'color',
    description: 'Default background color for the interface.',
  },
  'on-background': {
    value: '#757575',
    type: 'color',
    description: 'Text or icon color used on background surfaces.',
  },

  surface: {
    value: '#FFFFFF',
    type: 'color',
    description: 'Default surface color for cards and containers.',
  },
  'on-surface': {
    value: '#929292',
    type: 'color',
    description: 'Text or icon color used on surface elements.',
  },

  error: {
    value: '#E61D1D',
    type: 'color',
    description: 'Color representing error states and critical messages.',
  },
  'on-error': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color for text/icons on error surfaces.',
  },
  'error-hover': {
    value: '#CD0000',
    type: 'color',
    description: 'Foreground color for text/icons on error surfaces.',
  },

  warning: {
    value: '#BE5702',
    type: 'color',
    description: 'Color representing warning states and cautionary messages.',
  },
  'on-warning': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color for text/icons on warning surfaces.',
  },
  'warning-hover': {
    value: '#A64C03',
    type: 'color',
    description: 'Foreground color for text/icons on warning surfaces.',
  },

  success: {
    value: '#1C8731',
    type: 'color',
    description: 'Color representing success states and positive messages.',
  },
  'on-success': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color for text/icons on success surfaces.',
  },
  'success-hover': {
    value: '#1F7629',
    type: 'color',
    description: 'Foreground color for text/icons on success surfaces.',
  },

  divider: {
    value: '#E6E6E6',
    type: 'color',
    description: 'Color used for borders and dividers between elements.',
  },
  disabled: {
    value: '#E6E6E6',
    type: 'color',
    description: 'Color used for disabled text and icons.',
  },
  'text-disabled': {
    value: '#B3B3B3',
    type: 'color',
    description: 'Text color used for disabled elements.',
  },
};

export default colors;
