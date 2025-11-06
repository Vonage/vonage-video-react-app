import { describe, it, expect } from 'vitest';
import customTheme, { colors, fonts } from './customTheme';

describe('customTheme', () => {
  describe('MUI theme object', () => {
    it('should have correct palette colors', () => {
      expect(customTheme.palette.primary.main).toBe(colors.primary);
      expect(customTheme.palette.primary.contrastText).toBe(colors.onPrimary);
      expect(customTheme.palette.background.default).toBe(colors.background);
      expect(customTheme.palette.text.primary).toBe(colors.onBackground);
    });

    it('should have typography configured', () => {
      expect(customTheme.typography.fontFamily).toBe(fonts.family);
    });

    it('should be in light mode', () => {
      expect(customTheme.palette.mode).toBe('light');
    });

    it('should have correct button primary styles', () => {
      const primaryButton = customTheme.components?.MuiButton?.styleOverrides?.containedPrimary;

      if (
        typeof primaryButton === 'object' &&
        primaryButton !== null &&
        'backgroundColor' in primaryButton &&
        'color' in primaryButton &&
        'boxShadow' in primaryButton
      ) {
        expect((primaryButton as { backgroundColor: string }).backgroundColor).toBe(colors.primary);
        expect((primaryButton as { color: string }).color).toBe(colors.onPrimary);
      }
    });
  });

  describe('theme structure validation', () => {
    it('should have all required theme properties', () => {
      expect(customTheme.palette).toBeDefined();
      expect(customTheme.components).toBeDefined();
      expect(customTheme.typography).toBeDefined();
    });

    it('should have component overrides for major components', () => {
      const { components } = customTheme;
      expect(components?.MuiAppBar).toBeDefined();
      expect(components?.MuiPaper).toBeDefined();
      expect(components?.MuiTooltip).toBeDefined();
    });
  });

  describe('color consistency', () => {
    it('should use consistent primary color across components', () => {
      const buttonPrimary = customTheme.components?.MuiButton?.styleOverrides?.containedPrimary;
      const outlinedPrimary = customTheme.components?.MuiButton?.styleOverrides?.outlinedPrimary;
      const textPrimary = customTheme.components?.MuiButton?.styleOverrides?.textPrimary;

      if (
        typeof buttonPrimary === 'object' &&
        buttonPrimary !== null &&
        'backgroundColor' in buttonPrimary &&
        typeof outlinedPrimary === 'object' &&
        outlinedPrimary !== null &&
        'color' in outlinedPrimary &&
        typeof textPrimary === 'object' &&
        textPrimary !== null &&
        'color' in textPrimary
      ) {
        expect((buttonPrimary as { backgroundColor: string }).backgroundColor).toBe(colors.primary);
        expect((outlinedPrimary as { color: string }).color).toBe(colors.primary);
        expect((textPrimary as { color: string }).color).toBe(colors.primary);
      }
    });

    it('should use consistent surface colors', () => {
      const appBar = customTheme.components?.MuiAppBar?.styleOverrides?.root;
      const paper = customTheme.components?.MuiPaper?.styleOverrides?.root;

      if (
        typeof appBar === 'object' &&
        appBar !== null &&
        typeof paper === 'object' &&
        paper !== null
      ) {
        if (typeof appBar === 'object' && appBar !== null && 'backgroundColor' in appBar) {
          expect((appBar as { backgroundColor: string }).backgroundColor).toBe(colors.surface);
        }
        if (typeof paper === 'object' && paper !== null && 'backgroundColor' in paper) {
          expect((paper as { backgroundColor: string }).backgroundColor).toBe(colors.background);
        }
      }
    });
  });
});
