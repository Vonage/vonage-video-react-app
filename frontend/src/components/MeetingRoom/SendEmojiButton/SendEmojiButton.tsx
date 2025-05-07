import { Button, Grid, GridSize } from '@mui/material';
import { ReactElement } from 'react';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import useSessionContext from '../../../hooks/useSessionContext';

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
  const xs: GridSize = isSmallViewport ? 2 : 3;
  const size = isSmallViewport ? 'small' : 'large';

  return (
    <Grid item xs={xs} className="flex justify-center">
      <Button
        size={size}
        onClick={() => sendEmoji(emoji)}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
          },
          padding: '0.25rem',
          fontSize: '1.5rem',
        }}
      >
        {emoji}
      </Button>
    </Grid>
  );
};

export default SendEmojiButton;
