import { ReactElement, type ComponentProps } from 'react';
import type { EmojiWrapper } from '../../../hooks/useEmoji';
import { EMOJI_DISPLAY_DURATION } from '../../../utils/constants';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';

export type EmojiProps = {
  emojiWrapper: EmojiWrapper;
} & ComponentProps<'div'>;

/**
 * Emoji Component
 *
 * Displays an emoji sent from a user in the meeting.
 * @param {EmojiProps} props - The props for the component.
 * @returns {ReactElement} - The Emoji Component.
 */
const Emoji = ({ emojiWrapper, className, style, ...props }: EmojiProps): ReactElement => {
  const { emoji, name } = emojiWrapper;

  return (
    <div
      data-testid="emoji-string-container"
      className={twMerge(
        'text-vera-subtitle absolute z-1 flex flex-col max-w-[35%]',
        'animate-[moveEmoji_1ms_linear_1]',
        'ml-5 vera-desktop:ml-[15%]',
        className
      )}
      style={{
        animationDuration: `${EMOJI_DISPLAY_DURATION}ms`,
        ...style,
      }}
      {...props}
    >
      {emoji}
      <span
        className={classNames(
          'text-vera-body-base',
          'text-vera-accent',
          'overflow-hidden',
          'text-ellipsis',
          'whitespace-nowrap',
          'rounded-2xl',
          'px-3 py-1',
          'bg-vera-on-accent',
          'mt-0.5 vera-desktop:mt-2'
        )}
      >
        {name}
      </span>
    </div>
  );
};

export default Emoji;
