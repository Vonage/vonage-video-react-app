import { describe, it, expect } from 'vitest';
import customTheme, { colors, fonts, shadows, rgba } from './customTheme';

describe('customTheme', () => {
  describe('colors object', () => {
    it('should have primary colors defined', () => {
      expect(colors.primary).toBe('#3E007E');
      expect(colors.onPrimary).toBe('#FFFFFF');
      expect(colors.primaryContainer).toBe('#6300C4');
      expect(colors.surfaceTint).toBe('#7F02F7');
    });

    it('should have secondary colors defined', () => {
      expect(colors.secondary).toBe('#2F293B');
      expect(colors.onSecondary).toBe('#FFFFFF');
      expect(colors.secondaryContainer).toBe('#4C4659');
    });

    it('should have background and surface colors', () => {
      expect(colors.background).toBe('#FEF7FF');
      expect(colors.surface).toBe('#FCF8F8');
      expect(colors.onBackground).toBe('#1E1925');
      expect(colors.onSurface).toBe('#000000');
    });

    it('should have error colors defined', () => {
      expect(colors.error).toBe('#600004');
      expect(colors.onError).toBe('#FFFFFF');
      expect(colors.errorContainer).toBe('#98000A');
    });
  });

  describe('fonts object', () => {
    it('should have correct font family string', () => {
      expect(fonts.family).toBe('Comic Sans MS,Marker Felt,Trebuchet MS,fantasy,cursive');
    });
  });

  describe('shadows object', () => {
    it('should have all shadow levels defined', () => {
      expect(shadows.level1).toContain('0 3px 1px -2px rgba(0,0,0,0.2)');
      expect(shadows.level2).toContain('0 2px 4px -1px rgba(0,0,0,0.2)');
      expect(shadows.level3).toContain('0 5px 5px -3px rgba(0,0,0,0.2)');
    });
  });

  describe('rgba helper function', () => {
    it('should convert hex to rgba correctly', () => {
      expect(rgba('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(rgba('#000000', 1)).toBe('rgba(0, 0, 0, 1)');
      expect(rgba('#FFFFFF', 0.26)).toBe('rgba(255, 255, 255, 0.26)');
    });

    it('should handle hex colors with hash', () => {
      expect(rgba('#3E007E', 0.04)).toBe('rgba(62, 0, 126, 0.04)');
    });
  });

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

    it('should have button component overrides', () => {
      const buttonOverrides = customTheme.components?.MuiButton?.styleOverrides;
      expect(buttonOverrides).toBeDefined();
      expect(buttonOverrides?.containedPrimary).toBeDefined();
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
        expect((primaryButton as { boxShadow: string }).boxShadow).toBe(shadows.level1);
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
      expect(components?.MuiButton).toBeDefined();
      expect(components?.MuiAppBar).toBeDefined();
      expect(components?.MuiPaper).toBeDefined();
      expect(components?.MuiTextField).toBeDefined();
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
          expect((paper as { backgroundColor: string }).backgroundColor).toBe(
            colors.surfaceContainer
          );
        }
      }
    });
  });
});
