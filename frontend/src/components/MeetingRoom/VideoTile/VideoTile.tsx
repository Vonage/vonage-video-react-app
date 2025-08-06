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

export type VideoTileProps = {
  'data-testid': string;
  box: Box | undefined;
  children: ReactNode;
  className?: string;
  hasVideo: boolean;
  id: string;
  isHidden?: boolean;
  isTalking?: boolean;
  onMouseLeave?: () => void;
  onMouseEnter?: () => void;
  isScreenshare?: boolean;
};

/**
 * VideoTile Component
 *
 * A reusable video tile component for publishers and subscribers.
 * @param {VideoTileProps} props - The props for the component
 *  @property {string} 'data-testid' - Used for testing
 *  @property {Box | undefined} box - Box specifying position and size of tile
 *  @property {ReactNode} children - The content to be rendered
 *  @property {string} className - (optional) - the className for the tile
 *  @property {boolean} hasVideo - whether the video has video
 *  @property {string} id - the id of the tile
 *  @property {boolean} isHidden - (optional) whether the video tile is hidden
 *  @property {boolean} isTalking - (optional) whether the video has measurable audio
 *  @property {() => void} onMouseLeave - (optional) mouseLeave event handler
 *  @property {() => void} onMouseEnter - (optional) mouseEnter event handler
 *  @property {boolean} isScreenShare - (optional) whether the video is a screenshare
 * @returns {ReactElement} - The VideoTile component.
 */
const VideoTile = forwardRef(
  (
    {
      'data-testid': dataTestId,
      box,
      children,
      className,
      hasVideo,
      id,
      isHidden,
      isTalking,
      onMouseEnter,
      onMouseLeave,
      isScreenshare = false,
    }: VideoTileProps,
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

    // Zoom constraints
    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 3;
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

      // Check if wheel event is positive or negative
      const isWheelPositive = event.deltaY > 0;

      // Calculate new zoom level
      const deltaZoom = isWheelPositive ? -ZOOM_STEP : ZOOM_STEP;
      const newZoomLevel = Math.min(Math.max(zoomLevel + deltaZoom, MIN_ZOOM), MAX_ZOOM);

      setZoomLevel(newZoomLevel);
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
        className={`${className ?? ''} absolute m-1 flex items-center justify-center ${isHidden ? 'hidden' : ''} `}
        style={{
          ...getBoxStyle(box, isScreenshare),
          overflow: 'hidden',
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
          className={`relative left-0 top-0 size-full overflow-hidden rounded-xl ${isTalking ? 'outline outline-2 outline-sky-500' : ''} ${!hasVideo ? 'hidden' : ''}`}
          ref={ref}
          style={{
            backgroundColor: 'rgba(60, 64, 67, 0.55)',
            ...getTransformStyle(),
          }}
        />
        <div
          className={`relative left-0 top-0 size-full overflow-hidden rounded-xl bg-notVeryGray-100 ${isTalking ? 'outline outline-2 outline-sky-500' : ''} ${hasVideo ? 'hidden' : ''}`}
          style={getTransformStyle()}
        />
        {children}

        <ZoomIndicator resetZoom={resetZoom} zoomLevel={zoomLevel} />
      </div>
    );
  }
);

export default VideoTile;
