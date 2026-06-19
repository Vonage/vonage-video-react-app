import { CSSProperties, ReactElement } from 'react';
import { EmojiWrapper } from '../../../hooks/useEmoji';
import { EMOJI_DISPLAY_DURATION } from '../../../utils/constants';
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
    <div
      data-testid="emoji-string-container"
      className="text-vera-subtitle absolute z-1 flex flex-col max-w-[35%]"
      style={{
        ...style,
        marginLeft: isSmallViewport ? '1.25rem' : '15%',
      }}
    >
      {emoji}

      <span
        className={`
          text-vera-body-base
          text-vera-accent
          overflow-hidden
          text-ellipsis
          whitespace-nowrap
          rounded-2xl
          px-3
          py-1
          bg-vera-on-accent
          ${isSmallViewport ? 'mt-0.5' : 'mt-2'}
        `}
      >
        {name}
      </span>
    </div>
  );
};

export default Emoji;
