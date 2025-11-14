/**
 * Color Tokens
 *
 * These tokens define the core color system used throughout the interface.
 * Each token represents a semantic purpose — rather than a specific hex value —
 * allowing color changes to propagate consistently across the design system.
 */

const colorVariables = {
  cta: {
    50: '#F5F0FD',
    500: '#9941FF',
    600: '#871EFF',
  },
  information: {
    50: '#E8F4FB',
    400: '#2997F0',
    500: '#0276D5',
  },
  canvas: '#FFFFFF',
  'canvas-text': '#000000',
  accent: {
    300: '#B3B3B3',
    400: '#929292',
    500: '#757575',
    600: '#666666',
  },
  neutral: {
    100: '#E6E6E6',
    300: '#B3B3B3',
    400: '#929292',
    500: '#757575',
  },
  alert: {
    500: '#E61D1D',
    600: '#CD0000',
  },
  warning: {
    500: '#BE5702',
    600: '#A64C03',
  },
  success: {
    500: '#1C8731',
    600: '#1F7629',
  },
};

const lightColors = {
  primary: {
    value: colorVariables.cta[500],
    type: 'color',
    description: 'Main brand color used for primary actions and highlights.',
  },
  'text-primary': {
    value: colorVariables.cta[500],
    type: 'color',
    description: 'Primary text color used for main content and headings.',
  },
  'on-primary': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color used on primary surfaces.',
  },
  'primary-hover': {
    value: colorVariables.cta[600],
    type: 'color',
    description: 'Main brand color for hovering.',
  },

  secondary: {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Secondary brand color and accent.',
  },
  'text-secondary': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Secondary text color used for subheadings and less prominent content.',
  },
  'on-secondary': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color used on secondary surfaces.',
  },

  tertiary: {
    value: colorVariables.accent[500],
    type: 'color',
    description: 'Tertiary brand color and accent.',
  },
  'text-tertiary': {
    value: colorVariables.accent[500],
    type: 'color',
    description: 'Tertiary text color used for less prominent content.',
  },
  'on-tertiary': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color used on tertiary surfaces.',
  },

  background: {
    value: colorVariables.cta[50],
    type: 'color',
    description: 'Default background color for the interface.',
  },
  'on-background': {
    value: colorVariables.accent[500],
    type: 'color',
    description: 'Text or icon color used on background surfaces.',
  },

  surface: {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Default surface color for cards and containers.',
  },
  'on-surface': {
    value: colorVariables.accent[400],
    type: 'color',
    description: 'Text or icon color used on surface elements.',
  },

  error: {
    value: colorVariables.alert[500],
    type: 'color',
    description: 'Color representing error states and critical messages.',
  },
  'on-error': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color for text/icons on error surfaces.',
  },
  'error-hover': {
    value: colorVariables.alert[600],
    type: 'color',
    description: 'Error color for hover states.',
  },

  warning: {
    value: colorVariables.warning[500],
    type: 'color',
    description: 'Color representing warning states and cautionary messages.',
  },
  'on-warning': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color for text/icons on warning surfaces.',
  },
  'warning-hover': {
    value: colorVariables.warning[600],
    type: 'color',
    description: 'Warning color for hover states.',
  },

  success: {
    value: colorVariables.success[500],
    type: 'color',
    description: 'Color representing success states and positive messages.',
  },
  'on-success': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color for text/icons on success surfaces.',
  },
  'success-hover': {
    value: colorVariables.success[600],
    type: 'color',
    description: 'Success color for hover states.',
  },

  border: {
    value: colorVariables.neutral[100],
    type: 'color',
    description: 'Color used for borders and dividers between elements.',
  },
  disabled: {
    value: colorVariables.neutral[100],
    type: 'color',
    description: 'Color used for disabled backgrounds.',
  },
  'text-disabled': {
    value: colorVariables.neutral[300],
    type: 'color',
    description: 'Text color used for disabled elements.',
  },
};

const darkColors = {
  primary: {
    value: colorVariables.cta[500],
    type: 'color',
    description: 'Main brand color used for primary actions and highlights.',
  },
  'text-primary': {
    value: colorVariables.cta[500],
    type: 'color',
    description: 'Primary text color used for main content and headings.',
  },
  'on-primary': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color used on primary surfaces.',
  },
  'primary-hover': {
    value: colorVariables.cta[600],
    type: 'color',
    description: 'Main brand color for hovering.',
  },

  secondary: {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Secondary brand color and accent.',
  },
  'text-secondary': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Secondary text color used for subheadings and less prominent content.',
  },
  'on-secondary': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Foreground color used on secondary surfaces.',
  },

  tertiary: {
    value: colorVariables.accent[400],
    type: 'color',
    description: 'Tertiary brand color and accent.',
  },
  'text-tertiary': {
    value: colorVariables.accent[400],
    type: 'color',
    description: 'Tertiary text color used for less prominent content.',
  },
  'on-tertiary': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Foreground color used on tertiary surfaces.',
  },

  background: {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Default background color for the interface.',
  },
  'on-background': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Text or icon color used on background surfaces.',
  },

  surface: {
    value: colorVariables.accent[600],
    type: 'color',
    description: 'Default surface color for cards and containers.',
  },
  'on-surface': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Text or icon color used on surface elements.',
  },

  error: {
    value: colorVariables.alert[500],
    type: 'color',
    description: 'Color representing error states and critical messages.',
  },
  'on-error': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color for text/icons on error surfaces.',
  },
  'error-hover': {
    value: colorVariables.alert[600],
    type: 'color',
    description: 'Error color for hover states.',
  },

  warning: {
    value: colorVariables.warning[500],
    type: 'color',
    description: 'Color representing warning states and cautionary messages.',
  },
  'on-warning': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color for text/icons on warning surfaces.',
  },
  'warning-hover': {
    value: colorVariables.warning[600],
    type: 'color',
    description: 'Warning color for hover states.',
  },

  success: {
    value: colorVariables.success[500],
    type: 'color',
    description: 'Color representing success states and positive messages.',
  },
  'on-success': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color for text/icons on success surfaces.',
  },
  'success-hover': {
    value: colorVariables.success[600],
    type: 'color',
    description: 'Success color for hover states.',
  },

  border: {
    value: colorVariables.accent[500],
    type: 'color',
    description: 'Color used for borders and dividers between elements.',
  },
  disabled: {
    value: colorVariables.accent[600],
    type: 'color',
    description: 'Color used for disabled backgrounds.',
  },
  'text-disabled': {
    value: colorVariables.accent[400],
    type: 'color',
    description: 'Text color used for disabled elements.',
  },
};

const colors = {
  light: lightColors,
  dark: darkColors,
};

// Maintain backward compatibility
export default lightColors;
export { colors, lightColors, darkColors };
