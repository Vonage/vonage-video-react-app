import { useRef, useState, useEffect, ReactElement } from 'react';
import { CircularProgress, useMediaQuery } from '@mui/material';
import waitUntilPlaying from '../../../utils/waitUntilPlaying';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const isSMViewport = useMediaQuery(`(max-width:500px)`);
  const isMDViewport = useMediaQuery(`(max-width:768px)`);
  const isTabletViewport = useMediaQuery(`(max-width:899px)`);

  useEffect(() => {
    if (publisherVideoElement && containerRef.current) {
      containerRef.current.appendChild(publisherVideoElement);
      const myVideoElement = publisherVideoElement as HTMLElement;
      myVideoElement.classList.add('video__element');
      myVideoElement.title = 'publisher-preview';
      myVideoElement.style.borderRadius = '12px';
      myVideoElement.style.maxHeight = isTabletViewport ? '80%' : '450px';

      let width = '100%';
      if ((isFixedWidth && isTabletViewport) || (!isFixedWidth && isMDViewport)) {
        width = '80%';
      }
      myVideoElement.style.width = width;

      myVideoElement.style.marginLeft = 'auto';
      myVideoElement.style.marginRight = 'auto';
      myVideoElement.style.marginBottom = '1px';
      myVideoElement.style.transform = 'scaleX(-1)';
      myVideoElement.style.objectFit = 'contain';
      myVideoElement.style.aspectRatio = '16 / 9';
      myVideoElement.style.boxShadow =
        '0 1px 2px 0 rgba(60, 64, 67, .3), 0 1px 3px 1px rgba(60, 64, 67, .15)';

      waitUntilPlaying(publisherVideoElement).then(() => {
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
  ]);

  let containerWidth = '100%';
  if (isFixedWidth) {
    containerWidth = isTabletViewport ? '80%' : '90%';
  } else if (isMDViewport) {
    containerWidth = '80%';
  }

  return (
    <div data-testid="background-video-container">
      {!isParentVideoEnabled && (
        <div className="background-video-container-disabled" style={{ width: containerWidth }}>
          You have not enabled video
        </div>
      )}
      {isParentVideoEnabled && <div ref={containerRef} />}
      {isVideoLoading && isParentVideoEnabled && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: 16 }}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default BackgroundVideoContainer;
