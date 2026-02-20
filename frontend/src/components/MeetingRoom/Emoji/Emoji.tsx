import { CSSProperties, ReactElement } from 'react';
import { EmojiWrapper } from '../../../hooks/useEmoji';
import { EMOJI_DISPLAY_DURATION } from '../../../utils/constants';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import useIsSmallViewport from '@hooks/useIsSmallViewport';

export type EmojiProps = {
  emojiWrapper: EmojiWrapper;
};

/**
 * Emoji Component
 *
 * Displays an emoji sent from a user in the meeting.
 * @param {EmojiProps} props - The props for the component.
 * @returns {ReactElement} - The Emoji Component.
 */
const Emoji = ({ emojiWrapper }: EmojiProps): ReactElement => {
  const theme = useTheme();
  const isSmallViewport = useIsSmallViewport();
  const { emoji, name } = emojiWrapper;
  const style: CSSProperties = {
    position: 'absolute',
    animationName: 'moveEmoji',
    // Adding an extra 100 ms to ensure the emoji does not re-render at bottom of page on animation end
    animationDuration: `${EMOJI_DISPLAY_DURATION + 100}ms`,
    animationTimingFunction: 'linear',
    animationIterationCount: 1,
    maxWidth: '35%',
    zIndex: 1,
  };

  return (
    <Box
      data-testid="emoji-string-container"
      sx={{
        ...style,
        ml: isSmallViewport ? 5 : '15%',
        display: 'flex',
        flexDirection: 'column',
        fontSize: isSmallViewport
          ? theme.typography.typeScale.mobile['subtitle'].fontSize.value
          : theme.typography.typeScale.desktop['subtitle'].fontSize.value,
      }}
    >
      {emoji}
      <Chip
        label={name}
        size="small"
        sx={{
          mt: isSmallViewport ? 0.5 : 2,
          color: theme.colors.onDarkGrey,
          backgroundColor: theme.colors.darkGrey,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: isSmallViewport
            ? theme.typography.typeScale.mobile['body-base'].fontSize.value
            : theme.typography.typeScale.desktop['body-base'].fontSize.value,
        }}
      />
    </Box>
  );
};

export default Emoji;
