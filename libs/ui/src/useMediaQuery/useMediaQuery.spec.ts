import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import * as mui from '@mui/material';
import useMediaQuery from './useMediaQuery';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof mui>('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call MUI useMediaQuery with query string', () => {
    (mui.useMediaQuery as Mock).mockReturnValue(true);

    const { result } = renderHook(() => useMediaQuery('(max-width:600px)'));

    expect(mui.useMediaQuery).toHaveBeenCalledWith('(max-width:600px)', undefined);
    expect(result.current).toBe(true);
  });

  it('should call MUI useMediaQuery with query function', () => {
    (mui.useMediaQuery as Mock).mockReturnValue(false);

    const queryFn = (theme: mui.Theme) => theme.breakpoints.down('md');
    const { result } = renderHook(() => useMediaQuery(queryFn));

    expect(mui.useMediaQuery).toHaveBeenCalledWith(queryFn, undefined);
    expect(result.current).toBe(false);
  });

  it('should pass options to MUI useMediaQuery', () => {
    (mui.useMediaQuery as Mock).mockReturnValue(true);

    const options = {
      defaultMatches: false,
      noSsr: true,
    };

    const { result } = renderHook(() => useMediaQuery('(max-width:600px)', options));

    expect(mui.useMediaQuery).toHaveBeenCalledWith('(max-width:600px)', options);
    expect(result.current).toBe(true);
  });

  it('should update when media query match changes', () => {
    (mui.useMediaQuery as Mock).mockReturnValue(true);

    const { result, rerender } = renderHook(() => useMediaQuery('(max-width:600px)'));

    expect(result.current).toBe(true);

    (mui.useMediaQuery as Mock).mockReturnValue(false);
    rerender();

    expect(result.current).toBe(false);
  });

  it('should handle all option properties', () => {
    (mui.useMediaQuery as Mock).mockReturnValue(true);

    const matchMedia = (query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    });

    const ssrMatchMedia = (_query: string) => ({ matches: false });

    const options = {
      defaultMatches: false,
      matchMedia,
      noSsr: false,
      ssrMatchMedia,
    };

    renderHook(() => useMediaQuery('(max-width:600px)', options));

    expect(mui.useMediaQuery).toHaveBeenCalledWith('(max-width:600px)', options);
  });
});
