import { ReactElement, useEffect, useRef } from 'react';
import { Box } from 'opentok-layout-js';
import { Publisher } from '@vonage/client-sdk-video';
import VideoTile from '../VideoTile';
import ScreenShareNameDisplay from '../../ScreenShareNameDisplay';
import useTheme from '@ui/theme';

export type ScreenSharePublisherProps = {
  box: Box | undefined;
  element: HTMLElement | HTMLObjectElement | undefined;
  publisher: Publisher | null;
};

/**
 * ScreenSharePublisher Component
 * Video Tile for local screen share publisher
 * @param {ScreenSharePublisherProps} props - the props for this component
 *   @property {Box} box - Box specifying position and size of Video Tile
 *   @property {HTMLElement | HTMLObjectElement | undefined} element - VideoElement
 *   @property {Publisher | null} publisher-- Publisher object for local screen share
 * @returns {ReactElement | undefined} - ScreenSharePublisher Component
 */
const ScreenSharePublisher = ({
  box,
  element,
  publisher,
}: ScreenSharePublisherProps): ReactElement | undefined => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (element && containerRef.current) {
      Object.assign(element.style, {
        width: '100%',
        position: 'absolute',
        borderRadius: theme.shapes.borderRadiusLarge,
        objectFit: 'contain',
      });
      containerRef.current.appendChild(element);
    }
  }, [element, theme.shapes.borderRadiusLarge]);
  const streamName = publisher?.stream?.name ?? '';
  return (
    box && (
      <VideoTile
        id="screen-publisher-container"
        box={box}
        data-testid="screen-publisher-container"
        hasVideo
        ref={containerRef}
        isScreenshare
      >
        <ScreenShareNameDisplay name={streamName} box={box} />
      </VideoTile>
    )
  );
};

export default ScreenSharePublisher;
