import { ReactElement } from 'react';
import useTheme from '@ui/theme';
import useSessionContext from '../../../hooks/useSessionContext';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import Grid from '@mui/material/Grid';
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
  const theme = useTheme();
  const isSmallViewport = useIsSmallViewport();
  const xs = isSmallViewport ? 2 : 3;
  const size = isSmallViewport ? 'small' : 'large';

  return (
    <Grid item xs={xs} sx={{ display: 'flex', justifyContent: 'center' }}>
      <Button
        size={size}
        onClick={() => sendEmoji(emoji)}
        sx={{
          '&:hover': {
            backgroundColor: theme.colors.background,
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
