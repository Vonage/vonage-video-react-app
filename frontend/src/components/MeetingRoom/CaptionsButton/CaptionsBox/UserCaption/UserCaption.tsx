import { Subscriber } from '@vonage/client-sdk-video';
import { ReactElement, useState, useRef, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import useReceivingCaptions from '../../../../../hooks/useReceivingCaptions';
import useCaptionsTranslation from './hooks/useCaptionsTranslation';
import { CAPTION_DISPLAY_DURATION_MS } from '../../../../../utils/constants';

export type UserCaptionProps = {
  subscriber: Subscriber;
  speakerName: string;
  isSmallViewPort: boolean;
};

/**
 * UserCaption component to display captions for a specific user.
 * @param {UserCaptionProps} props - The props for the component.
 * @property {Subscriber} subscriber - The subscriber object for which to display captions.
 * @property {string} speakerName - The name shown before the caption.
 * @property {boolean} isSmallViewPort - whether it is a small viewport (mobile view or small tab).
 * @returns {ReactElement | null} - The rendered caption or null if not receiving captions.
 */
const UserCaption = ({
  subscriber,
  speakerName,
  isSmallViewPort,
}: UserCaptionProps): ReactElement | null => {
  const { caption: displayCaption, isReceivingCaptions: isActive } = useReceivingCaptions({
    subscriber,
  });
  useCaptionsTranslation(subscriber);

  const [visible, setVisible] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && displayCaption) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => setVisible(false), CAPTION_DISPLAY_DURATION_MS);
    } else {
      setVisible(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayCaption, isActive]);

  if (!visible || !displayCaption) {
    return null;
  }

  return (
    <div>
      <Typography
        variant="body2"
        className="text-vera-on-dark-grey"
        sx={{
          mb: 0.5,
          wordBreak: 'break-word',
          lineHeight: 1.4,
          textAlign: 'left',
          fontSize: isSmallViewPort ? '1rem' : '1.25rem',
        }}
      >
        <strong>{speakerName}: </strong> {displayCaption}
      </Typography>
    </div>
  );
};

export default UserCaption;
