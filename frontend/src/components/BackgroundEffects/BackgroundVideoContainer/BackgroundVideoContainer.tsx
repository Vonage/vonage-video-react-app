import { useRef, useState, useEffect, ReactElement } from 'react';
import { CircularProgress, useMediaQuery } from '@mui/material';
import waitUntilPlaying from '../../../utils/waitUntilPlaying';

export type BackgroundVideoContainerProps = {
  fixedWidth?: boolean;
  publisherVideoElement?: HTMLObjectElement | HTMLVideoElement | undefined;
  isParentVideoEnabled?: boolean;
};

const BackgroundVideoContainer = ({
  fixedWidth = false,
  publisherVideoElement,
  isParentVideoEnabled = false,
}: BackgroundVideoContainerProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoLoading, setVideoLoading] = useState<boolean>(true);
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
      if (fixedWidth) {
        myVideoElement.style.width = isTabletViewport ? '80%' : '100%';
      } else {
        myVideoElement.style.width = isMDViewport ? '80%' : '100%';
      }
      if (isSMViewport) {
        myVideoElement.style.width = '100%';
      }
      myVideoElement.style.marginLeft = 'auto';
      myVideoElement.style.marginRight = 'auto';
      myVideoElement.style.marginBottom = '1px';
      myVideoElement.style.transform = 'scaleX(-1)';
      myVideoElement.style.objectFit = 'contain';
      myVideoElement.style.aspectRatio = '16 / 9';
      myVideoElement.style.boxShadow =
        '0 1px 2px 0 rgba(60, 64, 67, .3), 0 1px 3px 1px rgba(60, 64, 67, .15)';

      waitUntilPlaying(publisherVideoElement).then(() => {
        setVideoLoading(false);
      });
    }
  }, [
    isTabletViewport,
    isMDViewport,
    isSMViewport,
    publisherVideoElement,
    fixedWidth,
    isParentVideoEnabled,
  ]);

  let containerWidth = '100%';
  if (fixedWidth) {
    containerWidth = isTabletViewport ? '80%' : '90%';
  } else {
    containerWidth = isMDViewport ? '80%' : '100%';
  }
  if (isSMViewport) {
    containerWidth = '100%';
  }

  return (
    <div>
      {!isParentVideoEnabled && (
        <div className="background-video-container-disabled" style={{ width: containerWidth }}>
          You have not enabled video
        </div>
      )}
      {isParentVideoEnabled && <div ref={containerRef} />}
      {videoLoading && isParentVideoEnabled && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: 16 }}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default BackgroundVideoContainer;
