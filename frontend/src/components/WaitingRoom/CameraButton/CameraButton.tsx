import { ReactElement } from 'react';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';
import DeviceToggleButton from '../DeviceToggleButton';
import { env } from '../../../env';

/**
 * CameraButton Component
 *
 * Toggles the camera for the preview publisher (keeping the background-effects publisher's video in
 * sync). When the browser has blocked the camera the button shows the video-off icon plus a warning
 * badge and a "blocked" tooltip (Google Meet style), and a click re-requests browser access instead.
 * @returns {ReactElement | false} - The CameraButton component.
 */
const CameraButton = (): ReactElement | false => {
  const { toggleVideo } = usePreviewPublisherContext();
  const { toggleVideo: toggleBackgroundVideoPublisher } = useBackgroundPublisherContext();

  const toggleCameraEverywhere = () => {
    toggleVideo();
    toggleBackgroundVideoPublisher();
  };

  return (
    env.ALLOW_CAMERA_CONTROL && (
      <DeviceToggleButton device="camera" onToggle={toggleCameraEverywhere} />
    )
  );
};

export default CameraButton;
