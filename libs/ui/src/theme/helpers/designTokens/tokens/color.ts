import type { ThemeTokens } from '../../../ThemeProvider.types';

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
    300: '#CBA1FA',
    400: '#B27BF2',
    500: '#9941FF',
    600: '#871EFF',
    900: '#26044D',
  },
  information: {
    50: '#E8F4FB',
    200: '#9DD2FE',
    300: '#65BAFF',
    400: '#2997F0',
    500: '#0276D5',
    800: '#0E306D',
    900: '#071939',
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
    600: '#666666',
    800: '#333333',
    900: '#272626',
  },
  'dark-grey': {
    10: '#333333CD',
    100: '#333333',
    400: '#292828',
    500: '#202124',
  },

  alert: {
    50: '#FFEEF2',
    100: '#FEDFDF',
    300: '#FE9696',
    400: '#F75959',
    500: '#E61D1D',
    600: '#CD0000',
    800: '#6E0000',
    900: '#3E0004',
  },
  warning: {
    200: '#FACC4B',
    300: '#FA9F00',
    500: '#BE5702',
    600: '#A64C03',
  },
  success: {
    300: '#53CA6A',
    400: '#30A849',
    500: '#1C8731',
    600: '#1F7629',
  },
};
const lightColors: ThemeTokens['colors'] = {
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
  'secondary-hover': {
    value: colorVariables.accent[600],
    type: 'color',
    description: 'Secondary color for hover states.',
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
  'tertiary-hover': {
    value: colorVariables.accent[400],
    type: 'color',
    description: 'Tertiary color for hover states.',
  },

  accent: {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Accent color.',
  },
  'on-accent': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Foreground color used on accent surfaces.',
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

  'alert-background': {
    value: colorVariables.alert[50],
    type: 'color',
    description: 'Background color for alert messages and notifications.',
  },
  'alert-background-hover': {
    value: colorVariables.alert[100],
    type: 'color',
    description: 'Hover background color for alert messages and notifications.',
  },
  'alert-text': {
    value: colorVariables.alert[600],
    type: 'color',
    description: 'Text color for alert messages and notifications.',
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
  information: {
    value: colorVariables.information[500],
    type: 'color',
    description: 'Color representing informational states and messages.',
  },
  'on-information': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color for text/icons on information surfaces.',
  },
  'information-hover': {
    value: colorVariables.information[400],
    type: 'color',
    description: 'Information color for hover states.',
  },
  'information-background': {
    value: colorVariables.information[50],
    type: 'color',
    description: 'Background color for informational messages.',
  },
  border: {
    value: colorVariables.neutral[100],
    type: 'color',
    description: 'Color used for borders and dividers between elements.',
  },

  'dark-background': {
    value: colorVariables['dark-grey'][500],
    type: 'color',
    description: 'Darker grey background color.',
  },
  'dark-grey': {
    value: colorVariables['dark-grey'][100],
    type: 'color',
    description: 'Dark grey background color.',
  },
  'dark-grey-hover': {
    value: colorVariables['dark-grey'][400],
    type: 'color',
    description: 'Dark grey hover background color.',
  },
  'on-dark-grey': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color for text/icons on dark grey surfaces.',
  },
  'dark-grey-opacity': {
    value: colorVariables['dark-grey']['10'],
    type: 'color',
    description: 'Dark grey background color with opacity.',
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
  'skeleton-like': {
    value: colorVariables.neutral[300],
    type: 'color',
    description: 'Color used for skeleton loading states.',
  },
};

const darkColors: ThemeTokens['colors'] = {
  primary: {
    value: colorVariables.cta[400],
    type: 'color',
    description: 'Main brand color used for primary actions and highlights.',
  },
  'text-primary': {
    value: colorVariables.cta[400],
    type: 'color',
    description: 'Primary text color used for main content and headings.',
  },
  'on-primary': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Foreground color used on primary surfaces.',
  },
  'primary-hover': {
    value: colorVariables.cta[300],
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
    description: 'Secondary text for subheadings, improved readability.',
  },
  'on-secondary': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Foreground color used on secondary surfaces.',
  },
  'secondary-hover': {
    value: colorVariables.accent[400],
    type: 'color',
    description: 'Secondary color for hover states.',
  },

  tertiary: {
    value: colorVariables.accent[300],
    type: 'color',
    description: 'Tertiary brand color and accent.',
  },
  'text-tertiary': {
    value: colorVariables.accent[300],
    type: 'color',
    description: 'Tertiary text color used for less prominent content.',
  },
  'on-tertiary': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Foreground color used on tertiary surfaces.',
  },
  'tertiary-hover': {
    value: colorVariables.accent[300],
    type: 'color',
    description: 'Tertiary color for hover states.',
  },

  accent: {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Accent color.',
  },
  'on-accent': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Foreground color used on accent surfaces.',
  },
  background: {
    value: colorVariables.cta[900],
    type: 'color',
    description: 'Default background color for the interface.',
  },
  'on-background': {
    value: colorVariables.neutral[300],
    type: 'color',
    description: 'Text or icon color used on background surfaces.',
  },
  surface: {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Default surface color for cards and containers.',
  },
  'on-surface': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Text or icon color used on surface elements.',
  },

  'alert-background': {
    value: colorVariables.alert[900],
    type: 'color',
    description: 'Background color for alert messages and notifications.',
  },
  'alert-background-hover': {
    value: colorVariables.alert[800],
    type: 'color',
    description: 'Hover background color for alert messages and notifications.',
  },
  'alert-text': {
    value: colorVariables.alert[100],
    type: 'color',
    description: 'Text color for alert messages and notifications.',
  },

  error: {
    value: colorVariables.alert[400],
    type: 'color',
    description: 'Color representing error states and critical messages.',
  },
  'on-error': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Foreground color for text/icons on error surfaces.',
  },
  'error-hover': {
    value: colorVariables.alert[300],
    type: 'color',
    description: 'Error color for hover states.',
  },
  warning: {
    value: colorVariables.warning[300],
    type: 'color',
    description: 'Color representing warning states and cautionary messages.',
  },
  'on-warning': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Foreground color for text/icons on warning surfaces.',
  },
  'warning-hover': {
    value: colorVariables.warning[200],
    type: 'color',
    description: 'Warning color for hover states.',
  },
  success: {
    value: colorVariables.success[400],
    type: 'color',
    description: 'Color representing success states and positive messages.',
  },
  'on-success': {
    value: colorVariables['canvas-text'],
    type: 'color',
    description: 'Foreground color for text/icons on success surfaces.',
  },
  'success-hover': {
    value: colorVariables.success[300],
    type: 'color',
    description: 'Success color for hover states.',
  },

  information: {
    value: colorVariables.information[400],
    type: 'color',
    description: 'Color representing informational states and messages.',
  },
  'on-information': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color for text/icons on information surfaces.',
  },
  'information-hover': {
    value: colorVariables.information[500],
    type: 'color',
    description: 'Information color for hover states.',
  },
  'information-background': {
    value: colorVariables.information[50],
    type: 'color',
    description: 'Background color for informational messages.',
  },

  border: {
    value: colorVariables.neutral[800],
    type: 'color',
    description: 'Color used for borders and dividers between elements.',
  },

  'dark-background': {
    value: colorVariables['dark-grey'][500],
    type: 'color',
    description: 'Darker grey background color.',
  },
  'dark-grey': {
    value: colorVariables['dark-grey'][100],
    type: 'color',
    description: 'Dark grey background color.',
  },
  'dark-grey-hover': {
    value: colorVariables['dark-grey'][400],
    type: 'color',
    description: 'Dark grey hover background color.',
  },
  'on-dark-grey': {
    value: colorVariables.canvas,
    type: 'color',
    description: 'Foreground color for text/icons on dark grey surfaces.',
  },
  'dark-grey-opacity': {
    value: colorVariables['dark-grey']['10'],
    type: 'color',
    description: 'Dark grey background color with opacity.',
  },
  disabled: {
    value: colorVariables.neutral[800],
    type: 'color',
    description: 'Color used for disabled backgrounds.',
  },
  'text-disabled': {
    value: colorVariables.neutral[600],
    type: 'color',
    description: 'Text color used for disabled elements.',
  },
  'skeleton-like': {
    value: colorVariables.neutral[800],
    type: 'color',
    description: 'Color used for skeleton loading states.',
  },
};

const colors: Record<'light' | 'dark', ThemeTokens['colors']> = {
  light: lightColors,
  dark: darkColors,
};

export default colors;
