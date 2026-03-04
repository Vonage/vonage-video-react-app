import { useRef, useState, useEffect, ReactElement } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import CircularProgress from '@mui/material/CircularProgress';
import useTheme from '@ui/theme';
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
  const theme = useTheme();

  useEffect(() => {
    if (publisherVideoElement && containerRef.current) {
      containerRef.current.appendChild(publisherVideoElement);
      const myVideoElement = publisherVideoElement as HTMLElement;
      myVideoElement.classList.add('video__element');

      // eslint-disable-next-line react-hooks/immutability
      myVideoElement.title = 'publisher-preview';

      // eslint-disable-next-line react-hooks/immutability
      myVideoElement.style.borderRadius = theme.shapes.borderRadiusLarge;
      myVideoElement.style.maxHeight = isTabletViewport ? '80%' : '450px';

      let width = '100%';
      if (
        (isFixedWidth && isTabletViewport) ||
        (!isFixedWidth && isMDViewport) ||
        (isLGViewport && isFixedWidth)
      ) {
        width = '95%';
      }
      myVideoElement.style.width = width;

      myVideoElement.style.marginLeft = 'auto';
      myVideoElement.style.marginRight = 'auto';
      myVideoElement.style.marginBottom = '1px';
      myVideoElement.style.transform = 'scaleX(-1)';
      myVideoElement.style.objectFit = 'contain';
      myVideoElement.style.aspectRatio = '16 / 9';

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
    theme.shapes.borderRadiusLarge,
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
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: isTabletViewport ? '80%' : '450px',
            background: theme.colors.secondary,
            borderRadius: theme.shapes.borderRadiusMedium,
            aspectRatio: '16 / 9',
            padding: '1rem',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: theme.typography.weight['body-base'].value,
              color: theme.colors.onSecondary,
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
