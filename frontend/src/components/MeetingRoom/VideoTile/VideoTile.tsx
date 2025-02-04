import { Box } from 'opentok-layout-js';
import { ForwardedRef, forwardRef, ReactElement, ReactNode, useState } from 'react';
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
    }: VideoTileProps,
    ref: ForwardedRef<HTMLDivElement>
  ): ReactElement => {
    return (
      <div
        id={id}
        data-testid={dataTestId}
        className={`group/video-tile ${className ?? ''} m-1 absolute flex items-center justify-center ${isHidden ? 'hidden' : ''} `}
        style={getBoxStyle(box)}
      >
        <div
          className={`relative left-0 top-0 w-full h-full rounded-xl overflow-hidden ${isTalking ? 'outline outline-2 outline-sky-500' : ''} ${!hasVideo ? 'hidden' : ''}`}
          ref={ref}
        />
        <div
          className={`relative left-0 top-0 w-full h-full rounded-xl bg-notVeryGray-100 overflow-hidden ${isTalking ? 'outline outline-2 outline-sky-500' : ''} ${hasVideo ? 'hidden' : ''}`}
        />
        {children}
      </div>
    );
  }
);

export default VideoTile;
