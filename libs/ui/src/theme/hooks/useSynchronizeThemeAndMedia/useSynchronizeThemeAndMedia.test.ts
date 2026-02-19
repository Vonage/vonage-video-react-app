import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useSynchronizeThemeAndMedia from './';

describe('useSynchronizeThemeAndMedia', () => {
  beforeEach(() => {
    document.documentElement.className = '';
  });

  it('should set initial light mode classes and subscribe to media changes', () => {
    const setTokens = vi.fn();
    const addEventListenerSpy = vi.fn();
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
    });

    vi.spyOn(window, 'matchMedia').mockImplementation(matchMediaMock);

    renderHook(() => useSynchronizeThemeAndMedia({ setTokens }));

    expect(document.documentElement.classList.contains('vera-dark-mode')).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
      expect.any(AbortController)
    );
  });

  it('should set initial dark mode classes when media prefers dark', () => {
    const setTokens = vi.fn();
    const matchMediaMock = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
    });

    vi.spyOn(window, 'matchMedia').mockImplementation(matchMediaMock);

    renderHook(() => useSynchronizeThemeAndMedia({ setTokens }));

    expect(document.documentElement.classList.contains('vera-dark-mode')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should call setTokens when media query changes', () => {
    const setTokens = vi.fn();
    let changeHandler: (() => void) | undefined;
    const addEventListenerSpy = vi.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
    });

    vi.spyOn(window, 'matchMedia').mockImplementation(matchMediaMock);

    renderHook(() => useSynchronizeThemeAndMedia({ setTokens }));

    // Change to dark mode
    matchMediaMock.mockReturnValue({ matches: true, addEventListener: vi.fn() });
    changeHandler!();

    expect(setTokens).toHaveBeenCalled();
    expect(document.documentElement.classList.contains('vera-dark-mode')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should cleanup by aborting the controller', () => {
    const setTokens = vi.fn();
    const abortController = new AbortController();
    const abortSpy = vi.spyOn(abortController, 'abort');
    const addEventListenerSpy = vi.fn();

    vi.spyOn(globalThis, 'AbortController').mockImplementation(() => abortController);

    const matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: addEventListenerSpy,
    });

    vi.spyOn(window, 'matchMedia').mockImplementation(matchMediaMock);

    const { unmount } = renderHook(() => useSynchronizeThemeAndMedia({ setTokens }));

    unmount();

    expect(abortSpy).toHaveBeenCalled();
  });
});
