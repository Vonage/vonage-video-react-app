import { Subscriber } from '@vonage/client-sdk-video';
import { ReactElement, useState, useRef, useEffect } from 'react';
import { Typography } from '@mui/material';
import useReceivingCaptions from '../../../../../hooks/useReceivingCaptions';
import { CAPTION_TIMEOUT_MS } from '../../../../../utils/constants';

export type SingleCaptionProps = {
  subscriber: Subscriber;
};

/**
 * SingleCaption component to display captions for a specific subscriber.
 * @param {SingleCaptionProps} props - The props for the component.
 * @property {Subscriber} subscriber - The subscriber object for which to display captions.
 * @returns {ReactElement | null } - The rendered caption or null if not receiving captions.
 */
const SingleCaption = ({ subscriber }: SingleCaptionProps): ReactElement | null => {
  const { captionText, isReceivingCaptions } = useReceivingCaptions({ subscriber });
  const [visible, setVisible] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isReceivingCaptions && captionText) {
      setVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => setVisible(false), CAPTION_TIMEOUT_MS);
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
  }, [captionText, isReceivingCaptions]);

  if (!visible) {
    return null;
  }

  return (
    <div>
      <Typography
        variant="body2"
        sx={{
          mb: 0.5,
          wordBreak: 'break-word',
          lineHeight: 1.4,
          textAlign: 'left',
          color: 'white',
          fontSize: '1.1rem',
        }}
      >
        <strong>{subscriber?.stream?.name}: </strong> {captionText}
      </Typography>
    </div>
  );
};

export default SingleCaption;
