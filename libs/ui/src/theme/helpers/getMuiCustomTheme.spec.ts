import { describe, it, expect } from 'vitest';
import getMuiCustomTheme from './getMuiCustomTheme';
import getTokensByMode from './getTokensByMode';

const customTheme = getMuiCustomTheme({
  tokens: getTokensByMode('light'),
});

describe('customTheme', () => {
  it('should have palette defined', () => {
    expect(customTheme.palette).toBeDefined();
  });

  it('should have primary color defined', () => {
    expect(customTheme.palette.primary.main).toBeDefined();
    expect(typeof customTheme.palette.primary.main).toBe('string');
  });

  it('should have shape with borderRadius as number', () => {
    expect(customTheme.shape).toBeDefined();
    expect(typeof customTheme.shape.borderRadius).toBe('number');
  });

  it('should have typography variants defined', () => {
    expect(customTheme.typography.h1).toBeDefined();
    expect(customTheme.typography.h2).toBeDefined();
    expect(customTheme.typography.body1).toBeDefined();
    expect(customTheme.typography.body2).toBeDefined();
  });

  it('should have components with styleOverrides', () => {
    expect(customTheme.components).toBeDefined();
    expect(customTheme.components?.MuiButton).toBeDefined();
    expect(customTheme.components?.MuiButton?.styleOverrides).toBeDefined();
  });

  it('should have custom palette colors', () => {
    const { palette } = customTheme;
    expect(palette.tertiary).toBeDefined();
    expect(palette.hover).toBeDefined();
    expect(palette.disabled).toBeDefined();
  });

  it('should have text colors defined', () => {
    const { text } = customTheme.palette;
    expect(text.primary).toBeDefined();
    expect(text.secondary).toBeDefined();
    expect(text.tertiary).toBeDefined();
    expect(text.main).toBeDefined();
  });
});
