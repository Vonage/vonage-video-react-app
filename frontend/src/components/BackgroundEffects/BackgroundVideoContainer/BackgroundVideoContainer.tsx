import { useRef, useState, useEffect, ReactElement } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import waitUntilPlaying from '../../../utils/waitUntilPlaying';
import useIsTabletViewport from '../../../hooks/useIsTabletViewport';

export type BackgroundVideoContainerProps = {
  isFixedWidth?: boolean;
  publisherVideoElement?: HTMLObjectElement | HTMLVideoElement | undefined;
  isParentVideoEnabled?: boolean;
};

/**
 * Component to render the video element for the background replacement preview publisher.
 * @param {BackgroundVideoContainerProps} props - The properties for the component
 *  @property {boolean} isFixedWidth - Whether to apply a fixed width to the video element
 *  @property {HTMLObjectElement | HTMLVideoElement} publisherVideoElement - The video element to display
 *  @property {boolean} isParentVideoEnabled - Whether the parent video is enabled
 * @returns {ReactElement} The rendered video container element
 */
const BackgroundVideoContainer = ({
  isFixedWidth = false,
  publisherVideoElement,
  isParentVideoEnabled = false,
}: BackgroundVideoContainerProps): ReactElement => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const isSMViewport = useMediaQuery(`(max-width:500px)`);
  const isMDViewport = useMediaQuery(`(max-width:768px)`);
  const isTabletViewport = useIsTabletViewport();
  const isLGViewport = useMediaQuery(`(max-width:1199px)`);

  useEffect(() => {
    if (publisherVideoElement && containerRef.current) {
      containerRef.current.appendChild(publisherVideoElement);
      const myVideoElement = publisherVideoElement as HTMLElement;
      myVideoElement.classList.add('video__element', 'rounded-vera-large');

      // eslint-disable-next-line react-hooks/immutability
      myVideoElement.title = 'publisher-preview';

      let width = '100%';
      if (
        (isFixedWidth && isTabletViewport) ||
        (!isFixedWidth && isMDViewport) ||
        (isLGViewport && isFixedWidth)
      ) {
        width = '95%';
      }

      Object.assign(myVideoElement.style, {
        maxHeight: isTabletViewport ? '80%' : '450px',
        width,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: '1px',
        transform: 'scaleX(-1)',
        objectFit: 'contain',
        aspectRatio: '16 / 9',
      });

      void waitUntilPlaying(publisherVideoElement).then(() => {
        setIsVideoLoading(false);
      });
    }
  }, [
    isTabletViewport,
    isMDViewport,
    isSMViewport,
    publisherVideoElement,
    isFixedWidth,
    isParentVideoEnabled,
    isLGViewport,
  ]);

  let containerWidth = '100%';
  if (isFixedWidth) {
    containerWidth = isTabletViewport ? '80%' : '95%';
  } else if (isMDViewport) {
    containerWidth = '80%';
  }

  return (
    <Box sx={{ mt: 1, width: containerWidth }} data-testid="background-video-container">
      {!isParentVideoEnabled && (
        <Box
          className="bg-vera-secondary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: isTabletViewport ? '80%' : '450px',
            borderRadius: '8px',
            aspectRatio: '16 / 9',
            padding: '1rem',
          }}
        >
          <Typography
            variant="h6"
            className="text-vera-on-secondary"
            sx={{
              fontWeight: 500,
            }}
          >
            {t('backgroundEffects.video.disabled')}
          </Typography>
        </Box>
      )}
      {isParentVideoEnabled && <div ref={containerRef} />}
      {isVideoLoading && isParentVideoEnabled && (
        <Box sx={{ display: 'flex', justifyContent: 'center', margin: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default BackgroundVideoContainer;
