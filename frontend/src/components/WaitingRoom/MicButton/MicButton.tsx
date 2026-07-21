import { ReactElement } from 'react';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import DeviceToggleButton from '../DeviceToggleButton';
import { env } from '../../../env';

/**
 * MicButton Component
 *
 * Toggles the user's microphone (published audio) for the preview publisher. When the browser has
 * blocked the microphone the button shows the muted icon plus a warning badge and a "blocked"
 * tooltip (Google Meet style), and a click re-requests browser access instead.
 * @returns {ReactElement | false} - The MicButton component.
 */
const MicButton = (): ReactElement | false => {
  const { toggleAudio } = usePreviewPublisherContext();

  return (
    env.ALLOW_MICROPHONE_CONTROL && (
      <DeviceToggleButton device="microphone" onToggle={toggleAudio} />
    )
  );
};

export default MicButton;
