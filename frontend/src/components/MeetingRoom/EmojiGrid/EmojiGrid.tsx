import { Dispatch, ReactElement, RefObject, SetStateAction } from 'react';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import EmojiGridMobile from './EmojiGridMobile';
import EmojiGridDesktop from './EmojiGridDesktop';

export type EmojiGridProps = {
  isEmojiGridOpen: boolean;
  setIsEmojiGridOpen: Dispatch<SetStateAction<boolean>>;
  anchorRef: RefObject<HTMLButtonElement | null>;
  isParentOpen: boolean;
};

/**
 * EmojiGrid Component
 *
 * Displays a grid of emojis.
 * @param {EmojiGridProps} props - the props for the component
 *  @property {RefObject<HTMLButtonElement | null>} anchorRef - the button ref for the grid
 *  @property {boolean} isEmojiGridOpen - whether the component will be open initially
 *  @property {Dispatch<SetStateAction<boolean>>} setIsEmojiGridOpen - toggle whether the emoji grid is shown or hidden
 *  @property {boolean} isParentOpen - whether the ToolbarOverflowMenu is open
 * @returns {ReactElement} - The EmojiGrid Component.
 */
const EmojiGrid = ({
  anchorRef,
  isEmojiGridOpen,
  setIsEmojiGridOpen,
  isParentOpen,
}: EmojiGridProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;

    if (isSmallViewport && !target.closest('#emoji-grid-toggle')) {
      return;
    }
    // If a user clicks the toggle button, we save their preference for later
    setIsEmojiGridOpen(false);
  };

  return isSmallViewport ? (
    <EmojiGridMobile
      handleClickAway={handleClickAway}
      isEmojiGridOpen={isEmojiGridOpen}
      isParentOpen={isParentOpen}
    />
  ) : (
    <EmojiGridDesktop
      handleClickAway={handleClickAway}
      isEmojiGridOpen={isEmojiGridOpen}
      anchorRef={anchorRef}
    />
  );
};

export default EmojiGrid;
