import { Dispatch, ReactElement, RefObject, SetStateAction } from 'react';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import EmojiGridMobile from './EmojiGridMobile';
import EmojiGridDesktop from './EmojiGridDesktop';

export type EmojiGridProps = {
  isEmojiGridOpen: boolean;
  setIsEmojiGridOpen: Dispatch<SetStateAction<boolean>>;
  anchorRef: RefObject<HTMLButtonElement>;
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

  const handleClickAway = () => {
    if (isSmallViewport) {
      return;
    }
    // If a user clicks the toggle button on mobile, we save their preference for later. If a user doesn't select
    // the toggle, the clickAwayListener will close the grid.
    setIsEmojiGridOpen(false);
  };

  return isSmallViewport ? (
    <EmojiGridMobile
      handleClickAway={handleClickAway}
      isEmojiGridOpen={isEmojiGridOpen}
      isToolbarOpen={isParentOpen}
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
