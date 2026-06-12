import { ReactElement, useEffect, useRef } from 'react';
import { Box } from 'opentok-layout-js';
import { Publisher } from '@vonage/client-sdk-video';
import VideoTile from '../VideoTile';
import ScreenShareNameDisplay from '../../ScreenShareNameDisplay';
import { useTranslation } from 'react-i18next';

export type ScreenSharePublisherProps = {
  box: Box | undefined;
  element: HTMLElement | HTMLObjectElement | undefined;
  publisher: Publisher | null;
  isEntireScreen: boolean;
  showLocalScreensharePreview: boolean;
  toggleLocalScreensharePreview: () => void;
};

/**
 * ScreenSharePublisher Component
 * Video Tile for local screen share publisher
 * @param {ScreenSharePublisherProps} props - the props for this component
 *   @property {Box} box - Box specifying position and size of Video Tile
 *   @property {HTMLElement | HTMLObjectElement | undefined} element - VideoElement
 *   @property {Publisher | null} publisher-- Publisher object for local screen share
 *   @property {boolean} isEntireScreen - Whether the local user is sharing the entire screen
 *   @property {boolean} showLocalScreensharePreview - Whether local screenshare preview is visible
 *   @property {() => void} toggleLocalScreensharePreview - Toggle local screenshare preview visibility
 * @returns {ReactElement | undefined} - ScreenSharePublisher Component
 */
const ScreenSharePublisher = ({
  box,
  element,
  publisher,
  isEntireScreen,
  showLocalScreensharePreview,
  toggleLocalScreensharePreview,
}: ScreenSharePublisherProps): ReactElement | undefined => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  useEffect(() => {
    if (element && containerRef.current) {
      element.classList.add('rounded-vera-large');
      Object.assign(element.style, {
        width: '100%',
        position: 'absolute',
        objectFit: 'contain',
      });
      containerRef.current.appendChild(element);
    }
  }, [element]);
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
        {isEntireScreen && !showLocalScreensharePreview ? (
          <div className="absolute inset-0 flex items-center justify-center text-vera-heading-4 font-vera-plain bg-vera-dark-background text-vera-on-secondary">
            <div>{t('screenSharing.dialog.hiddenMessage')}</div>
            <button
              type="button"
              className="rounded bg-vera-primary px-4 py-2 text-sm"
              onClick={toggleLocalScreensharePreview}
            >
              {t('screenSharing.dialog.showPreview')}
            </button>
          </div>
        ) : (
          <>
            <ScreenShareNameDisplay name={streamName} box={box} />
            {isEntireScreen && (
              <button
                type="button"
                className="absolute top-4 right-4 z-10 rounded bg-vera-primary px-4 py-2 text-sm text-vera-on-secondary"
                onClick={toggleLocalScreensharePreview}
              >
                {t('screenSharing.dialog.hidePreview')}
              </button>
            )}
          </>
        )}
      </VideoTile>
    )
  );
};

export default ScreenSharePublisher;
