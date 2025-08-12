import { Box } from 'opentok-layout-js';
import { ForwardedRef, forwardRef, ReactElement, ReactNode } from 'react';
import getBoxStyle from '../../../utils/helpers/getBoxStyle';

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
    return (
      <div
        id={id}
        data-testid={dataTestId}
        className={`${className ?? ''} absolute m-1 flex items-center justify-center ${isHidden ? 'hidden' : ''} `}
        style={getBoxStyle(box, isScreenshare)}
        onMouseEnter={() => onMouseEnter?.()}
        onMouseLeave={() => onMouseLeave?.()}
      >
        <div
          className={`relative left-0 top-0 size-full overflow-hidden rounded-xl ${isTalking ? 'outline outline-2 outline-sky-500' : ''} ${!hasVideo ? 'hidden' : ''}`}
          ref={ref}
          style={{
            backgroundColor: 'rgba(60, 64, 67, 0.55)',
          }}
        />
        <div
          className={`relative left-0 top-0 size-full overflow-hidden rounded-xl bg-notVeryGray-100 ${isTalking ? 'outline outline-2 outline-sky-500' : ''} ${hasVideo ? 'hidden' : ''}`}
        />
        {children}
      </div>
    );
  }
);

export default VideoTile;
