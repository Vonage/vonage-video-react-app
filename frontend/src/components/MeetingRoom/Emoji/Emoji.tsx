import { CSSProperties, ReactElement } from 'react';
import { Chip } from '@mui/material';
import { EmojiWrapper } from '../../../hooks/useEmoji';
import { EMOJI_DISPLAY_DURATION } from '../../../utils/constants';

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
  const { emoji, name } = emojiWrapper;
  const style: CSSProperties = {
    position: 'absolute',
    animationName: 'moveEmoji',
    // Adding an extra 100 ms to ensure the emoji does not re-render at bottom of page on animation end
    animationDuration: `${EMOJI_DISPLAY_DURATION + 100}ms`,
    animationTimingFunction: 'linear',
    animationIterationCount: 1,
    maxWidth: '35%',
  };

  return (
    <div style={style} className="ml-5 flex flex-col text-5xl md:ml-[15%] md:text-6xl">
      {emoji}
      <Chip
        label={name}
        size="small"
        sx={{
          color: 'white',
          backgroundColor: 'rgba(60, 64, 67, 0.55)',
        }}
        className="truncate text-sm md:text-lg"
      />
    </div>
  );
};

export default Emoji;
