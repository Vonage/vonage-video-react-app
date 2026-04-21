import { createRef, RefObject } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useFloatingPip, {
  cornerToPosition,
  findNearestCorner,
  FloatingPipCorner,
} from './useFloatingPip';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 800;
const PIP_WIDTH = 100;
const PIP_HEIGHT = 178;
const MARGIN = 16;

type MakeCanvasOptions = {
  width?: number;
  height?: number;
};

const makeCanvasRef = ({
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
}: MakeCanvasOptions = {}): RefObject<HTMLElement | null> => {
  const element = document.createElement('div');
  element.getBoundingClientRect = () =>
    ({
      width,
      height,
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
  const ref = createRef<HTMLElement>();
  (ref as { current: HTMLElement | null }).current = element;
  return ref;
};

type SyntheticPointerArg = Parameters<ReturnType<typeof useFloatingPip>['onPointerMove']>[0];

const makePointerArg = (init: {
  pointerId: number;
  clientX: number;
  clientY: number;
}): SyntheticPointerArg =>
  ({
    pointerId: init.pointerId,
    clientX: init.clientX,
    clientY: init.clientY,
    preventDefault: vi.fn(),
    currentTarget: document.createElement('div'),
  }) as unknown as SyntheticPointerArg;

describe('cornerToPosition', () => {
  const corners: Array<[FloatingPipCorner, { x: number; y: number }]> = [
    ['top-left', { x: MARGIN, y: MARGIN }],
    ['top-right', { x: CANVAS_WIDTH - PIP_WIDTH - MARGIN, y: MARGIN }],
    ['bottom-left', { x: MARGIN, y: CANVAS_HEIGHT - PIP_HEIGHT - MARGIN }],
    [
      'bottom-right',
      { x: CANVAS_WIDTH - PIP_WIDTH - MARGIN, y: CANVAS_HEIGHT - PIP_HEIGHT - MARGIN },
    ],
  ];

  it.each(corners)('returns %s position correctly', (corner, expected) => {
    expect(
      cornerToPosition(corner, CANVAS_WIDTH, CANVAS_HEIGHT, PIP_WIDTH, PIP_HEIGHT, MARGIN)
    ).toEqual(expected);
  });
});

describe('findNearestCorner', () => {
  it.each<[{ x: number; y: number }, FloatingPipCorner]>([
    [{ x: 20, y: 20 }, 'top-left'],
    [{ x: 350, y: 20 }, 'top-right'],
    [{ x: 20, y: 700 }, 'bottom-left'],
    [{ x: 350, y: 700 }, 'bottom-right'],
  ])('for position %s returns %s', (position, expected) => {
    expect(findNearestCorner(position, CANVAS_WIDTH, CANVAS_HEIGHT, PIP_WIDTH, PIP_HEIGHT)).toBe(
      expected
    );
  });
});

describe('useFloatingPip', () => {
  it('initialises position at the default bottom-right corner', () => {
    const canvasRef = makeCanvasRef();
    const { result } = renderHook(() =>
      useFloatingPip({
        canvasRef,
        pipWidth: PIP_WIDTH,
        pipHeight: PIP_HEIGHT,
        margin: MARGIN,
      })
    );

    expect(result.current.position).toEqual({
      x: CANVAS_WIDTH - PIP_WIDTH - MARGIN,
      y: CANVAS_HEIGHT - PIP_HEIGHT - MARGIN,
    });
    expect(result.current.isDragging).toBe(false);
  });

  it('honours a custom initial corner', () => {
    const canvasRef = makeCanvasRef();
    const { result } = renderHook(() =>
      useFloatingPip({
        canvasRef,
        pipWidth: PIP_WIDTH,
        pipHeight: PIP_HEIGHT,
        margin: MARGIN,
        initialCorner: 'top-left',
      })
    );

    expect(result.current.position).toEqual({ x: MARGIN, y: MARGIN });
  });

  it('starts a drag on pointer down and sets isDragging', () => {
    const canvasRef = makeCanvasRef();
    const { result } = renderHook(() =>
      useFloatingPip({
        canvasRef,
        pipWidth: PIP_WIDTH,
        pipHeight: PIP_HEIGHT,
        margin: MARGIN,
      })
    );

    act(() => {
      result.current.onPointerDown(makePointerArg({ pointerId: 1, clientX: 300, clientY: 700 }));
    });

    expect(result.current.isDragging).toBe(true);
  });

  it('snaps to the nearest corner on pointer release after a drag', () => {
    const canvasRef = makeCanvasRef();
    const { result } = renderHook(() =>
      useFloatingPip({
        canvasRef,
        pipWidth: PIP_WIDTH,
        pipHeight: PIP_HEIGHT,
        margin: MARGIN,
      })
    );

    act(() => {
      result.current.onPointerDown(makePointerArg({ pointerId: 1, clientX: 300, clientY: 700 }));
    });

    act(() => {
      result.current.onPointerMove(makePointerArg({ pointerId: 1, clientX: 50, clientY: 50 }));
    });

    act(() => {
      result.current.onPointerUp(makePointerArg({ pointerId: 1, clientX: 50, clientY: 50 }));
    });

    expect(result.current.isDragging).toBe(false);
    expect(result.current.position).toEqual({ x: MARGIN, y: MARGIN });
  });

  it('clamps the position inside the canvas while dragging', () => {
    const canvasRef = makeCanvasRef();
    const { result } = renderHook(() =>
      useFloatingPip({
        canvasRef,
        pipWidth: PIP_WIDTH,
        pipHeight: PIP_HEIGHT,
        margin: MARGIN,
      })
    );

    act(() => {
      result.current.onPointerDown(makePointerArg({ pointerId: 1, clientX: 300, clientY: 700 }));
    });

    act(() => {
      result.current.onPointerMove(
        makePointerArg({ pointerId: 1, clientX: -9999, clientY: -9999 })
      );
    });

    expect(result.current.position?.x).toBe(MARGIN);
    expect(result.current.position?.y).toBe(MARGIN);
  });

  it('invokes onTap on release when movement stays under the tap threshold', () => {
    const canvasRef = makeCanvasRef();
    const onTap = vi.fn();
    const { result } = renderHook(() =>
      useFloatingPip({
        canvasRef,
        pipWidth: PIP_WIDTH,
        pipHeight: PIP_HEIGHT,
        margin: MARGIN,
        onTap,
      })
    );

    act(() => {
      result.current.onPointerDown(makePointerArg({ pointerId: 1, clientX: 300, clientY: 700 }));
    });
    act(() => {
      result.current.onPointerUp(makePointerArg({ pointerId: 1, clientX: 301, clientY: 701 }));
    });

    expect(onTap).toHaveBeenCalledTimes(1);
  });
});
