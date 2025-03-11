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
    <div key="A">Button_A</div>,
    <div key="B">Button_B</div>,
    <div key="C">Button_C</div>,
    <div key="D">Button_D</div>,
    <div key="E">Button_E</div>,
  ] as unknown as ToolbarButtons;

  const TestComponent = () => {
    const toolbarButtonsToRender = useToolbarButtons({
      toolbarRef,
      mediaControlsRef,
      overflowAndExitRef,
      toolbarButtons,
    });

    return (
      <div>
        <div data-testid="center-buttons">{toolbarButtonsToRender.centerToolbarButtons}</div>
        <div data-testid="right-buttons">{toolbarButtonsToRender.rightToolbarButtons}</div>
      </div>
    );
  };

  beforeEach(() => {
    toolbarRef = { current: document.createElement('div') };
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

    expect(screen.queryAllByText(/Button_/).length).toBe(0);
  });

  it('returns only the first button when there is space for one button in the toolbar', () => {
    Object.defineProperty(toolbarRef.current, 'clientWidth', {
      configurable: true,
      writable: true,
      value: 442,
    });

    render(<TestComponent />);

    expect(screen.getByText(/Button_A/)).toBeInTheDocument();
    expect(screen.queryByText(/Button_B/)).not.toBeInTheDocument();
  });

  it('returns no duplicated objects', () => {
    Object.defineProperty(toolbarRef.current, 'clientWidth', {
      configurable: true,
      writable: true,
      value: 682,
    });

    render(<TestComponent />);

    expect(screen.getAllByText(/Button_/).length).toBe(toolbarButtons.length);
  });

  it('returns an empty right array if there is no space for extra buttons', () => {
    Object.defineProperty(toolbarRef.current, 'clientWidth', {
      configurable: true,
      writable: true,
      value: 562,
    });

    render(<TestComponent />);

    expect(screen.getByTestId('center-buttons').childNodes.length).toBe(3);
    expect(screen.getByTestId('right-buttons').childNodes.length).toBe(0);
  });
});
