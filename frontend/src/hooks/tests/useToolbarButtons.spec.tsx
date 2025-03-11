import { afterEach, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RefObject } from 'react';
import useToolbarButtons, { ToolbarButtons } from '../useToolbarButtons';

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

vi.mock('../../utils/constants', () => ({
  RIGHT_PANEL_BUTTON_COUNT: 2,
}));

describe('useToolbarButtons', () => {
  let toolbarRef: RefObject<HTMLDivElement>;
  let mediaControlsRef: RefObject<HTMLDivElement>;
  let overflowAndExitRef: RefObject<HTMLDivElement>;
  const toolbarButtons: ToolbarButtons = [
    'Button_A',
    'Button_B',
    'Button_C',
    'Button_D',
    'Button_E',
  ] as unknown as ToolbarButtons;

  const TestComponent = () => {
    const toolbarButtonsToRender = useToolbarButtons({
      toolbarRef,
      mediaControlsRef,
      overflowAndExitRef,
      toolbarButtons,
    });
    return (
      <div data-testid="rendered-toolbar-buttons">
        {toolbarButtonsToRender.centerToolbarButtons}
        {toolbarButtonsToRender.rightToolbarButtons}
      </div>
    );
  };

  beforeEach(() => {
    toolbarRef = { current: document.createElement('div') };
    if (toolbarRef.current) {
      toolbarRef.current.id = 'mock-toolbar';
    }
    mediaControlsRef = { current: document.createElement('div') };
    overflowAndExitRef = { current: document.createElement('div') };

    Object.defineProperty(mediaControlsRef.current, 'clientWidth', {
      configurable: true,
      writable: true,
      value: 214,
    });
    Object.defineProperty(overflowAndExitRef.current, 'clientWidth', {
      configurable: true,
      writable: true,
      value: 108,
    });
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
      return {
        paddingLeft: '30px',
        paddingRight: '30px',
      } as CSSStyleDeclaration;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('returns nothing when there is no space in the toolbar', async () => {
    Object.defineProperty(toolbarRef.current, 'clientWidth', {
      configurable: true,
      writable: true,
      value: 400,
    });

    render(<TestComponent />);

    expect(screen.getByTestId('rendered-toolbar-buttons')).toBeEmptyDOMElement();
  });

  it('returns the first button when there is space for a button in the toolbar', () => {
    Object.defineProperty(toolbarRef.current, 'clientWidth', {
      configurable: true,
      writable: true,
      value: 1,
    });

    // const { result } = renderHook(() => {
    //   useToolbarButtons({ toolbarRef, mediaControlsRef, overflowAndExitRef, toolbarButtons });
    // });

    // expect(result.current).toEqual({
    //   centerToolbarButtons: ['Button_A'],
    //   rightToolbarButtons: [],
    // });
    expect(true).toBe(false);
  });

  it('contains no duplicated objects in the right array', () => {
    expect(true).toBe(false);
  });

  it('returns an empty right array if there is no space for extra buttons', () => {
    expect(true).toBe(false);
  });
});
