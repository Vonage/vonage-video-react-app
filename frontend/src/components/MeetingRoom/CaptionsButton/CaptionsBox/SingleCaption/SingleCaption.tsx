import { Subscriber } from '@vonage/client-sdk-video';
import { ReactElement, useState, useRef, useEffect } from 'react';
import { Typography } from '@mui/material';
import useReceivingCaptions from '../../../../../hooks/useReceivingCaptions';
import { CAPTION_TIMEOUT_MS } from '../../../../../utils/constants';

export type SingleCaptionProps = {
  subscriber: Subscriber | null;
  isSmallViewPort: boolean;
  caption?: string;
};

/**
 * SingleCaption component to display captions for a specific user.
 * @param {SingleCaptionProps} props - The props for the component.
 * @property {Subscriber} subscriber - The subscriber object for which to display captions.
 * @property {boolean} isSmallViewPort - whether it is a small viewport (mobile view or small tab).
 * @property {string} caption - (optional) the caption text to display.
 * @returns {ReactElement | null} - The rendered caption or null if not receiving captions.
 */
const SingleCaption = ({
  subscriber,
  isSmallViewPort,
  caption,
}: SingleCaptionProps): ReactElement | null => {
  const { captionText, isReceivingCaptions } = useReceivingCaptions({
    subscriber,
  });

  const displayCaption = caption ?? captionText;
  const isActive = Boolean(caption ?? isReceivingCaptions);

  const [visible, setVisible] = useState<boolean>(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && displayCaption) {
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
  }, [displayCaption, isActive]);

  if (!visible || !displayCaption) {
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
          fontSize: isSmallViewPort ? '1rem' : '1.25rem',
        }}
      >
        <strong>{subscriber?.stream?.name ?? 'You'}: </strong> {displayCaption}
      </Typography>
    </div>
  );
};

export default SingleCaption;
