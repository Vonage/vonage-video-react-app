import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Dispatch, SetStateAction } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import useDropdownResizeObserver from '../useDropdownResizeObserver';

vi.mock('resize-observer-polyfill', () => ({
  default: vi.fn((cb: ResizeObserverCallback) => {
    return {
      observe: vi.fn().mockImplementation((target: HTMLElement) => {
        const entry: ResizeObserverEntry = {
          target,
          contentRect: target.getBoundingClientRect(),
          borderBoxSize: [{ inlineSize: target.clientWidth, blockSize: target.clientHeight }],
          contentBoxSize: [{ inlineSize: target.clientWidth, blockSize: target.clientHeight }],
          devicePixelContentBoxSize: [
            { inlineSize: target.clientWidth, blockSize: target.clientHeight },
          ],
        };
        cb([entry], this as unknown as ResizeObserver);
      }),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }),
}));

describe('useDropdownResizeObserver', () => {
  const mockSetIsOpen = vi.fn() as Dispatch<SetStateAction<boolean>>;
  let mockDropdownRefElement: HTMLElement;

  it('should initialize the resize observer', () => {
    mockDropdownRefElement = document.createElement('div');

    renderHook(() =>
      useDropdownResizeObserver({
        dropDownRefElement: mockDropdownRefElement,
        setIsOpen: mockSetIsOpen,
      })
    );
    expect(ResizeObserver).toHaveBeenCalled();
  });

  it('should call the function to close the dropdown when the window is smaller than the dropdown', () => {
    mockDropdownRefElement = document.createElement('div');
    Object.defineProperty(mockDropdownRefElement, 'offsetHeight', {
      configurable: true,
      writable: true,
      value: 50,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: 500,
    });

    renderHook(() =>
      useDropdownResizeObserver({
        dropDownRefElement: mockDropdownRefElement,
        setIsOpen: mockSetIsOpen,
      })
    );

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });
});
