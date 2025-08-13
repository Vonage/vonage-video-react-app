import { Box } from 'opentok-layout-js';
import {
  ForwardedRef,
  forwardRef,
  ReactElement,
  ReactNode,
  WheelEvent,
  useState,
  MouseEvent,
  useEffect,
} from 'react';
import getBoxStyle from '../../../utils/helpers/getBoxStyle';
import ZoomIndicator from '../ZoomIndicator';

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

    // Zoom constraints for screenshare content
    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 5; // Higher max zoom for screenshare content
    const ZOOM_STEP = 0.25;

    // Auto re-center when zoom returns to 100%
    useEffect(() => {
      if (zoomLevel === 1) {
        setPanOffset({ x: 0, y: 0 });
        setIsDragging(false);
      }
    }, [zoomLevel]);

    const onWheel = (event: WheelEvent<HTMLDivElement>) => {
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
      if (isDragging && zoomLevel > 1) {
        const deltaX = event.clientX - lastMousePosition.x;
        const deltaY = event.clientY - lastMousePosition.y;

        setPanOffset((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));

        setLastMousePosition({ x: event.clientX, y: event.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Apply zoom transform style
    const getTransformStyle = () => {
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
    };

    const resetZoom = () => {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setIsDragging(false);
    };

    return (
      <div
        id={id}
        data-testid={dataTestId}
        className={`${className ?? ''} absolute m-1 flex items-center justify-center`}
        style={{
          ...getBoxStyle(box, true), // Always true for screenshare
          overflow: 'hidden',
          position: 'relative', // Ensure positioning context for ZoomIndicator
        }}
        onMouseEnter={() => onMouseEnter?.()}
        onMouseLeave={() => {
          setIsDragging(false);
          onMouseLeave?.();
        }}
        onWheel={onWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          className="relative left-0 top-0 size-full overflow-hidden rounded-xl"
          ref={ref}
          style={{
            backgroundColor: 'rgba(60, 64, 67, 0.55)',
            ...getTransformStyle(),
          }}
        />
        <div
          className="relative left-0 top-0 hidden size-full overflow-hidden rounded-xl bg-notVeryGray-100"
          style={getTransformStyle()}
        />
        {children}

        <ZoomIndicator resetZoom={resetZoom} zoomLevel={zoomLevel} />
      </div>
    );
  }
);

ScreenshareVideoTile.displayName = 'ScreenshareVideoTile';

export default ScreenshareVideoTile;
