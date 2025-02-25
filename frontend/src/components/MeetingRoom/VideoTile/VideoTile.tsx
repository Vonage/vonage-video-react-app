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
};

/**
 * VideoTile Component
 *
 * A reusable video tile component for publishers and subscribers.
 * @param {VideoTileProps} props - The props for the component
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
    }: VideoTileProps,
    ref: ForwardedRef<HTMLDivElement>
  ): ReactElement => {
    return (
      <div
        id={id}
        data-testid={dataTestId}
        className={`${className ?? ''} absolute m-1 flex items-center justify-center ${isHidden ? 'hidden' : ''} `}
        style={getBoxStyle(box)}
        onMouseEnter={() => onMouseEnter?.()}
        onMouseLeave={() => onMouseLeave?.()}
      >
        <div
          className={`relative left-0 top-0 size-full overflow-hidden rounded-xl ${isTalking ? 'outline outline-2 outline-sky-500' : ''} ${!hasVideo ? 'hidden' : ''}`}
          ref={ref}
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
