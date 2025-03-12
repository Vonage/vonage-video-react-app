import { afterEach, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';
import useToolbarButtons from '../useToolbarButtons';

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
  let rightPanelControlsRef: RefObject<HTMLDivElement>;
  let timeRoomNameRef: RefObject<HTMLDivElement>;

  const numberOfToolbarButtons = 5;

  beforeEach(() => {
    toolbarRef = { current: document.createElement('div') };
    if (toolbarRef.current) {
      toolbarRef.current.id = 'toolbar-ref';
    }
    mediaControlsRef = { current: document.createElement('div') };
    overflowAndExitRef = { current: document.createElement('div') };
    rightPanelControlsRef = { current: document.createElement('div') };
    timeRoomNameRef = { current: document.createElement('div') };
    if (timeRoomNameRef.current) {
      timeRoomNameRef.current.id = 'time-room-name';
    }

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
    vi.spyOn(window, 'getComputedStyle').mockImplementation((elt: Element) => {
      if (elt.id === 'toolbar-ref') {
        return {
          paddingLeft: '30px',
          paddingRight: '30px',
        } as CSSStyleDeclaration;
      }
      if (elt.id === 'time-room-name') {
        return {
          marginRight: '12px',
        } as CSSStyleDeclaration;
      }
      return {
        marginLeft: '12px',
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
      value: 412,
    });

    const { result } = renderHook(() =>
      useToolbarButtons({
        toolbarRef,
        mediaControlsRef,
        overflowAndExitRef,
        rightPanelControlsRef,
        numberOfToolbarButtons,
        timeRoomNameRef,
      })
    );

    const { centerButtonLimit, rightButtonLimit, displayTimeRoomName } = result.current;
    expect(centerButtonLimit).toBe(0);
    expect(rightButtonLimit).toBe(0);
    expect(displayTimeRoomName).toBe(false);
  });

  it('returns only the first button when there is space for one button in the toolbar', () => {
    Object.defineProperty(toolbarRef.current, 'clientWidth', {
      configurable: true,
      writable: true,
      value: 466,
    });

    const { result } = renderHook(() =>
      useToolbarButtons({
        toolbarRef,
        mediaControlsRef,
        overflowAndExitRef,
        rightPanelControlsRef,
        numberOfToolbarButtons,
        timeRoomNameRef,
      })
    );

    const { centerButtonLimit, rightButtonLimit, displayTimeRoomName } = result.current;

    expect(centerButtonLimit).toBe(1);
    expect(rightButtonLimit).toBe(1);
    expect(displayTimeRoomName).toBe(false);
  });

  it('returns only the first three button when there is space for three button in the toolbar', () => {
    Object.defineProperty(toolbarRef.current, 'clientWidth', {
      configurable: true,
      writable: true,
      value: 586,
    });

    const { result } = renderHook(() =>
      useToolbarButtons({
        toolbarRef,
        mediaControlsRef,
        overflowAndExitRef,
        rightPanelControlsRef,
        numberOfToolbarButtons,
        timeRoomNameRef,
      })
    );

    const { centerButtonLimit, rightButtonLimit, displayTimeRoomName } = result.current;

    expect(centerButtonLimit).toBe(3);
    expect(rightButtonLimit).toBe(3);
    expect(displayTimeRoomName).toBe(false);
  });

  it('will display the TimeRoomName component and the max amount of right panel buttons', () => {
    Object.defineProperty(toolbarRef.current, 'clientWidth', {
      configurable: true,
      writable: true,
      value: 826,
    });

    const { result } = renderHook(() =>
      useToolbarButtons({
        toolbarRef,
        mediaControlsRef,
        overflowAndExitRef,
        rightPanelControlsRef,
        numberOfToolbarButtons,
        timeRoomNameRef,
      })
    );

    const { centerButtonLimit, rightButtonLimit, displayTimeRoomName } = result.current;

    expect(centerButtonLimit).toBe(3);
    expect(rightButtonLimit).toBe(5);
    expect(displayTimeRoomName).toBe(true);
  });
});
