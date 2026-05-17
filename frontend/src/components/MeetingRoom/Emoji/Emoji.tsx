import { CSSProperties, ReactElement } from 'react';
import { EmojiWrapper } from '../../../hooks/useEmoji';
import { EMOJI_DISPLAY_DURATION } from '../../../utils/constants';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import useIsSmallViewport from '@hooks/useIsSmallViewport';

export type EmojiProps = {
  emojiWrapper: EmojiWrapper;
};

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

  return (
    <Box
      data-testid="emoji-string-container"
      className="text-vera-subtitle flex flex-col"
      sx={{
        ...style,
        ml: isSmallViewport ? 5 : '15%',
      }}
    >
      {emoji}
      <Chip
        label={name}
        size="small"
        className="text-vera-on-dark-grey! bg-vera-dark-grey overflow-hidden text-ellipsis whitespace-nowrap"
        sx={{
          mt: isSmallViewport ? 0.5 : 2,
          fontSize: 'var(--vera-typography-body-base-font-size)',
        }}
      />
    </Box>
  );
};

export default Emoji;
