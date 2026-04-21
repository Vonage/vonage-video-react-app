import {
  PointerEvent as ReactPointerEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export type FloatingPipCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type FloatingPipPosition = {
  x: number;
  y: number;
};

export type UseFloatingPipArgs = {
  canvasRef: RefObject<HTMLElement | null>;
  pipWidth: number;
  pipHeight: number;
  initialCorner?: FloatingPipCorner;
  margin?: number;
  tapMovementThreshold?: number;
  onTap?: () => void;
};

export type UseFloatingPipResult = {
  position: FloatingPipPosition | null;
  isDragging: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const cornerToPosition = (
  corner: FloatingPipCorner,
  canvasWidth: number,
  canvasHeight: number,
  pipWidth: number,
  pipHeight: number,
  margin: number
): FloatingPipPosition => {
  const right = canvasWidth - pipWidth - margin;
  const bottom = canvasHeight - pipHeight - margin;
  switch (corner) {
    case 'top-left':
      return { x: margin, y: margin };
    case 'top-right':
      return { x: right, y: margin };
    case 'bottom-left':
      return { x: margin, y: bottom };
    case 'bottom-right':
    default:
      return { x: right, y: bottom };
  }
};

const findNearestCorner = (
  position: FloatingPipPosition,
  canvasWidth: number,
  canvasHeight: number,
  pipWidth: number,
  pipHeight: number
): FloatingPipCorner => {
  const centerX = position.x + pipWidth / 2;
  const centerY = position.y + pipHeight / 2;
  const isLeft = centerX < canvasWidth / 2;
  const isTop = centerY < canvasHeight / 2;
  if (isTop && isLeft) return 'top-left';
  if (isTop && !isLeft) return 'top-right';
  if (!isTop && isLeft) return 'bottom-left';
  return 'bottom-right';
};

const useFloatingPip = ({
  canvasRef,
  pipWidth,
  pipHeight,
  initialCorner = 'bottom-right',
  margin = 16,
  tapMovementThreshold = 6,
  onTap,
}: UseFloatingPipArgs): UseFloatingPipResult => {
  const [position, setPosition] = useState<FloatingPipPosition | null>(() => {
    if (typeof window === 'undefined') return null;
    const rect = canvasRef.current?.getBoundingClientRect();
    const width = rect?.width || window.innerWidth;
    const height = rect?.height || window.innerHeight;
    return cornerToPosition(initialCorner, width, height, pipWidth, pipHeight, margin);
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragState = useRef<{
    pointerId: number;
    startPointerX: number;
    startPointerY: number;
    startX: number;
    startY: number;
    maxDistance: number;
  } | null>(null);
  const currentCorner = useRef<FloatingPipCorner>(initialCorner);
  const onTapRef = useRef(onTap);
  useEffect(() => {
    onTapRef.current = onTap;
  }, [onTap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setPosition(
        cornerToPosition(currentCorner.current, width, height, pipWidth, pipHeight, margin)
      );
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef, pipWidth, pipHeight, margin]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!position) return;
      event.preventDefault();
      const target = event.currentTarget;
      if (target.setPointerCapture) {
        try {
          target.setPointerCapture(event.pointerId);
        } catch {
          /* setPointerCapture may throw in test environments without PointerEvent support */
        }
      }
      dragState.current = {
        pointerId: event.pointerId,
        startPointerX: event.clientX,
        startPointerY: event.clientY,
        startX: position.x,
        startY: position.y,
        maxDistance: 0,
      };
      setIsDragging(true);
    },
    [position]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !dragState.current) return;
      if (event.pointerId !== dragState.current.pointerId) return;
      const { width, height } = canvas.getBoundingClientRect();
      const deltaX = event.clientX - dragState.current.startPointerX;
      const deltaY = event.clientY - dragState.current.startPointerY;
      dragState.current.maxDistance = Math.max(
        dragState.current.maxDistance,
        Math.hypot(deltaX, deltaY)
      );
      const nextX = clamp(
        dragState.current.startX + deltaX,
        margin,
        Math.max(margin, width - pipWidth - margin)
      );
      const nextY = clamp(
        dragState.current.startY + deltaY,
        margin,
        Math.max(margin, height - pipHeight - margin)
      );
      setPosition({ x: nextX, y: nextY });
    },
    [canvasRef, pipWidth, pipHeight, margin]
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!dragState.current) return;
      if (event.pointerId !== dragState.current.pointerId) return;
      const wasTap = dragState.current.maxDistance < tapMovementThreshold;
      dragState.current = null;
      setIsDragging(false);
      const target = event.currentTarget;
      if (target.releasePointerCapture && target.hasPointerCapture?.(event.pointerId)) {
        try {
          target.releasePointerCapture(event.pointerId);
        } catch {
          /* releasePointerCapture may fail if capture was lost */
        }
      }
      if (wasTap) {
        onTapRef.current?.();
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { width, height } = canvas.getBoundingClientRect();
      setPosition((previous) => {
        if (!previous) return previous;
        const corner = findNearestCorner(previous, width, height, pipWidth, pipHeight);
        currentCorner.current = corner;
        return cornerToPosition(corner, width, height, pipWidth, pipHeight, margin);
      });
    },
    [canvasRef, pipWidth, pipHeight, margin, tapMovementThreshold]
  );

  const onPointerCancel = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!dragState.current) return;
    if (event.pointerId !== dragState.current.pointerId) return;
    dragState.current = null;
    setIsDragging(false);
    const target = event.currentTarget;
    if (target.releasePointerCapture && target.hasPointerCapture?.(event.pointerId)) {
      try {
        target.releasePointerCapture(event.pointerId);
      } catch {
        /* releasePointerCapture may fail if capture was lost */
      }
    }
  }, []);

  return { position, isDragging, onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
};

export default useFloatingPip;
export { cornerToPosition, findNearestCorner };
