import { useRef, useState, useEffect, ReactElement } from 'react';
import { CircularProgress, useMediaQuery } from '@mui/material';
import waitUntilPlaying from '../../../utils/waitUntilPlaying';

export type BackgroundVideoContainerProps = {
  fixedWidth?: boolean;
  publisherVideoElement?: HTMLObjectElement | HTMLVideoElement | undefined;
};

const BackgroundVideoContainer = ({
  fixedWidth = false,
  publisherVideoElement,
}: BackgroundVideoContainerProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoLoading, setVideoLoading] = useState<boolean>(true);
  const isMDViewport = useMediaQuery(`(max-width:899px)`);

  useEffect(() => {
    if (publisherVideoElement && containerRef.current) {
      containerRef.current.appendChild(publisherVideoElement);
      const myVideoElement = publisherVideoElement as HTMLElement;
      myVideoElement.classList.add('video__element');
      myVideoElement.title = 'publisher-preview';
      myVideoElement.style.borderRadius = '12px';
      myVideoElement.style.maxHeight = isMDViewport ? '80%' : '450px';
      if (fixedWidth) {
        myVideoElement.style.width = isMDViewport ? '80%' : '100%';
      }
      myVideoElement.style.marginLeft = 'auto';
      myVideoElement.style.marginRight = 'auto';
      myVideoElement.style.transform = 'scaleX(-1)';
      myVideoElement.style.objectFit = 'contain';
      myVideoElement.style.aspectRatio = '16 / 9';
      myVideoElement.style.boxShadow =
        '0 1px 2px 0 rgba(60, 64, 67, .3), 0 1px 3px 1px rgba(60, 64, 67, .15)';

      waitUntilPlaying(publisherVideoElement).then(() => {
        setVideoLoading(false);
      });
    }
  }, [isMDViewport, publisherVideoElement, fixedWidth]);

  // TODO: Handle case when video is not enabled (check outside enabled!)
  return (
    <div>
      <div ref={containerRef} />
      {videoLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: 16 }}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default BackgroundVideoContainer;
