import { CSSProperties, ReactElement } from 'react';
import { EmojiWrapper } from '../../../hooks/useEmoji';
import { EMOJI_DISPLAY_DURATION } from '../../../utils/constants';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
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
        fontSize: isSmallViewport ? '1.875rem' : '3.25rem',
      }}
    >
      {emoji}
      <Chip
        label={name}
        size="small"
        className="text-vera-on-dark-grey bg-vera-dark-grey"
        sx={{
          mt: isSmallViewport ? 0.5 : 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '0.875rem',
        }}
      />
    </Box>
  );
};

export default Emoji;
