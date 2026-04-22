import { ReactElement } from 'react';
import useSessionContext from '../../../hooks/useSessionContext';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import Button from '@mui/material/Button';

export type SendEmojiButtonProps = {
  emoji: string;
};

/**
 * SendEmojiButton Component
 *
 * Displays a clickable button to send emojis to all users in the meeting.
 * @param {SendEmojiButtonProps} props - The props for the component.
 * @returns {ReactElement} The SendEmojiButton component.
 */
const SendEmojiButton = ({ emoji }: SendEmojiButtonProps): ReactElement => {
  const { sendEmoji } = useSessionContext();
  const isSmallViewport = useIsSmallViewport();
  const xs = isSmallViewport ? 2 : 3;
  const size = isSmallViewport ? 'small' : 'large';

  return (
    <div className="flex justify-center" style={{ gridColumn: `span ${xs}` }}>
      <Button
        size={size}
        onClick={() => sendEmoji(emoji)}
        className="hover:bg-vera-background"
        sx={{ padding: '0.25rem', fontSize: '1.5rem' }}
      >
        {emoji}
      </Button>
    </div>
  );
};

export default SendEmojiButton;
