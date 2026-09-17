import { Box } from 'opentok-layout-js';
import {
  ForwardedRef,
  forwardRef,
  ReactElement,
  ReactNode,
  WheelEvent,
  useMemo,
  useRef,
  useState,
  MouseEvent,
  useEffect,
} from 'react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import getBoxStyle from '../../../utils/helpers/getBoxStyle';
import ZoomIndicator from '../ZoomIndicator';
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '../../../utils/constants';
import CustomBox from '@mui/material/Box';
import type { CSSProperties } from 'react';
import classNames from 'classnames';

export type ScreenshareVideoTileProps = {
  'data-testid': string;
  box: Box | undefined;
  children: ReactNode;
  className?: string;
  id: string;
  onMouseLeave?: () => void;
  onMouseEnter?: () => void;
};

/**
 * ScreenshareVideoTile Component
 *
 * A specialized video tile component for screenshare content with zoom and pan capabilities.
 * @param {ScreenshareVideoTileProps} props - The props for the component
 * @returns {ReactElement} - The ScreenshareVideoTile component.
 */
const ScreenshareVideoTile = forwardRef(
  (
    {
      'data-testid': dataTestId,
      box,
      children,
      className,
      id,
      onMouseEnter,
      onMouseLeave,
    }: ScreenshareVideoTileProps,
    ref: ForwardedRef<HTMLDivElement>
  ): ReactElement => {
    const isZoomSupported = hasMediaProcessorSupport('video');
    // Zoom state management
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
      x: 0,
      y: 0,
    });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [lastMousePosition, setLastMousePosition] = useState<{ x: number; y: number }>({
      x: 0,
      y: 0,
    });

    // Refs for rAF-based mousemove throttling to avoid excessive setState calls
    const pendingMouseMove = useRef<{ x: number; y: number } | null>(null);
    const rafId = useRef<number | null>(null);

    // Auto re-center when zoom returns to 100%
    useEffect(() => {
      if (zoomLevel === 1) {
        setPanOffset({ x: 0, y: 0 });
        setIsDragging(false);
      }
      return () => {
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
        pendingMouseMove.current = null;
      };
    }, [zoomLevel]);

    const onWheel = (event: WheelEvent<HTMLDivElement>) => {
      if (!isZoomSupported) return;

      event.preventDefault();

      const isWheelPositive = event.deltaY > 0;
      const deltaZoom = isWheelPositive ? -ZOOM_STEP : ZOOM_STEP;
      const newZoomLevel = Math.min(Math.max(zoomLevel + deltaZoom, MIN_ZOOM), MAX_ZOOM);

      // Get the container bounds and mouse position relative to container
      const rect = event.currentTarget.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Calculate the center of the container
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate the offset from center to mouse position
      const offsetX = mouseX - centerX;
      const offsetY = mouseY - centerY;

      // Calculate the new pan offset to keep the mouse position fixed during zoom
      // We need to account for the zoom change and current pan offset
      const zoomRatio = newZoomLevel / zoomLevel;
      const newPanX = panOffset.x * zoomRatio + offsetX * (1 - zoomRatio);
      const newPanY = panOffset.y * zoomRatio + offsetY * (1 - zoomRatio);

      setZoomLevel(newZoomLevel);
      setPanOffset({ x: newPanX, y: newPanY });
    };

    const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
      if (zoomLevel > 1) {
        setIsDragging(true);
        setLastMousePosition({ x: event.clientX, y: event.clientY });
      }
    };

    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
      if (!isDragging || zoomLevel <= 1) return;

      pendingMouseMove.current = { x: event.clientX, y: event.clientY };

      rafId.current ??= requestAnimationFrame(() => {
        const position = pendingMouseMove.current;
        if (position) {
          const deltaX = position.x - lastMousePosition.x;
          const deltaY = position.y - lastMousePosition.y;
          setPanOffset((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));
          setLastMousePosition({ x: position.x, y: position.y });
        }
        pendingMouseMove.current = null;
        rafId.current = null;
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      pendingMouseMove.current = null;
    };

    // Apply zoom transform style
    const transformStyle: CSSProperties = useMemo(() => {
      let cursor = 'default';
      if (zoomLevel > 1) {
        cursor = isDragging ? 'grabbing' : 'grab';
      }

      return {
        transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
        transformOrigin: 'center',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        cursor,
      };
    }, [zoomLevel, panOffset, isDragging]);

    const resetZoom = () => {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setIsDragging(false);
    };

    const zoomIn = () => {
      const newZoomLevel = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
      setZoomLevel(newZoomLevel);
      // Reset pan offset when zooming in from 1x to maintain center position
      if (zoomLevel === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
    };

    const zoomOut = () => {
      const newZoomLevel = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
      setZoomLevel(newZoomLevel);
      // Reset pan offset when zooming back to 1x
      if (newZoomLevel === 1) {
        setPanOffset({ x: 0, y: 0 });
      }
    };

    return (
      <CustomBox
        id={id}
        data-testid={dataTestId}
        className={classNames(
          'absolute flex items-center justify-center overflow-hidden',
          className
        )}
        style={getBoxStyle(box, true)}
        onMouseEnter={() => onMouseEnter?.()}
        onMouseLeave={() => {
          setIsDragging(false);
          if (rafId.current !== null) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
          }
          pendingMouseMove.current = null;
          onMouseLeave?.();
        }}
        onWheel={onWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <CustomBox
          ref={ref}
          className="relative left-0 top-[-4px] h-full w-full overflow-hidden rounded-vera-large bg-vera-dark-grey-opacity"
          style={transformStyle}
        />
        <CustomBox
          className="relative left-0 top-0 hidden h-full w-full overflow-hidden rounded-vera-large bg-vera-dark-grey-opacity"
          style={transformStyle}
        />
        {children}

        {isZoomSupported && (
          <ZoomIndicator
            resetZoom={resetZoom}
            zoomLevel={zoomLevel}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
          />
        )}
      </CustomBox>
    );
  }
);

ScreenshareVideoTile.displayName = 'ScreenshareVideoTile';

export default ScreenshareVideoTile;
