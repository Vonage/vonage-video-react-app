/**
 * Color Tokens
 *
 * These tokens define the core color system used throughout the interface.
 * Each token represents a semantic purpose — rather than a specific hex value —
 * allowing color changes to propagate consistently across the design system.
 */
const colors = {
  primary: {
    value: '#3E007E',
    type: 'color',
    description: 'Main brand color used for primary actions and highlights.',
  },
  'on-primary': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color used on primary surfaces.',
  },
  'primary-hover': {
    value: '#3E007E2F',
    type: 'color',
    description: 'Main brand color for hovering.',
  },

  secondary: {
    value: '#2F293B',
    type: 'color',
    description: 'Secondary brand color and accent.',
  },
  'on-secondary': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color used on secondary surfaces.',
  },

  tertiary: {
    value: '#2A005E',
    type: 'color',
    description: 'Tertiary brand color and accent.',
  },
  'on-tertiary': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color used on tertiary surfaces.',
  },

  background: {
    value: '#FFFFFF',
    type: 'color',
    description: 'Default background color for the interface.',
  },
  darkGrey: {
    value: '#202124',
    type: 'color',
    description: 'Dark grey color used for backgrounds and surfaces.',
  },
  'background-disabled': {
    value: '#f5f5f5',
    type: 'color',
    description: 'Background color for disabled elements.',
  },
  'on-background': {
    value: '#1E1925',
    type: 'color',
    description: 'Text or icon color used on background surfaces.',
  },

  surface: {
    value: '#FCF8F8',
    type: 'color',
    description: 'Default surface color for cards and containers.',
  },
  'on-surface': {
    value: '#000000',
    type: 'color',
    description: 'Text or icon color used on surface elements.',
  },

  error: {
    value: '#600004',
    type: 'color',
    description: 'Color representing error states and critical messages.',
  },
  'on-error': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color for text/icons on error surfaces.',
  },

  warning: {
    value: '#FCC723',
    type: 'color',
    description: 'Color representing warning states and cautionary messages.',
  },
  'on-warning': {
    value: '#000000',
    type: 'color',
    description: 'Foreground color for text/icons on warning surfaces.',
  },

  success: {
    value: '#2E8D32',
    type: 'color',
    description: 'Color representing success states and positive messages.',
  },
  'on-success': {
    value: '#FFFFFF',
    type: 'color',
    description: 'Foreground color for text/icons on success surfaces.',
  },

  'text-primary': {
    value: '#333333',
    type: 'color',
    description: 'Primary text color used for main content and headings.',
  },
  'text-secondary': {
    value: '#666666',
    type: 'color',
    description: 'Secondary text color used for subheadings and less prominent content.',
  },

  border: {
    value: '#DDDDDD',
    type: 'color',
    description: 'Color used for borders and dividers between elements.',
  },
  disabled: {
    value: '#999999',
    type: 'color',
    description: 'Color used for disabled text and icons.',
  },
  accent: {
    value: '#2E7D32',
    type: 'color',
    description: 'Accent color used for highlights and interactive elements.',
  },
};

export default colors;
