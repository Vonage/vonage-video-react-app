import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from '../../themeContext';
import useTheme from '.';

describe('useTheme', () => {
  it('should return colors object with all color tokens', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.colors).toBeDefined();
    expect(result.current.colors.primary).toBeDefined();
    expect(result.current.colors.secondary).toBeDefined();
    expect(result.current.colors.tertiary).toBeDefined();
    expect(result.current.colors.background).toBeDefined();
    expect(result.current.colors.surface).toBeDefined();
    expect(result.current.colors.error).toBeDefined();
    expect(result.current.colors.warning).toBeDefined();
    expect(result.current.colors.success).toBeDefined();
  });

  it('should return shapes object with all border radius tokens', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.shapes).toBeDefined();
    expect(result.current.shapes.borderRadiusNone).toBeDefined();
    expect(result.current.shapes.borderRadiusExtraSmall).toBeDefined();
    expect(result.current.shapes.borderRadiusSmall).toBeDefined();
    expect(result.current.shapes.borderRadiusMedium).toBeDefined();
    expect(result.current.shapes.borderRadiusLarge).toBeDefined();
    expect(result.current.shapes.borderRadiusExtraLarge).toBeDefined();
  });

  it('should return numeric values for border radius', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(typeof result.current.shapes.borderRadiusNone).toBe('string');
    expect(typeof result.current.shapes.borderRadiusMedium).toBe('string');
  });

  it('should return hex color strings', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(typeof result.current.colors.primary).toBe('string');
    expect(result.current.colors.primary).toMatch(/^#[0-9A-F]{6}$/i);
  });
});
