import { Dispatch, ReactElement, RefObject, SetStateAction } from 'react';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import EmojiGridMobile from './EmojiGridMobile';
import EmojiGridDesktop from './EmojiGridDesktop';

export type EmojiGridProps = {
  openEmojiGrid: boolean;
  setOpenEmojiGrid: Dispatch<SetStateAction<boolean>>;
  anchorRef: RefObject<HTMLButtonElement | null>;
  parentOpen: boolean;
};

/**
 * EmojiGrid Component
 *
 * Displays a grid of emojis.
 * @param {EmojiGridProps} props - the props for the component
 *  @property {RefObject<HTMLButtonElement | null>} anchorRef - the button ref for the grid
 *  @property {boolean} openEmojiGrid - whether the component will be open initially
 *  @property {Dispatch<SetStateAction<boolean>>} setOpenEmojiGrid - toggle whether the emoji grid is shown or hidden
 *  @property {boolean} parentOpen - whether the ToolbarOverflowMenu is open
 * @returns {ReactElement} - The EmojiGrid Component.
 */
const EmojiGrid = ({
  anchorRef,
  openEmojiGrid,
  setOpenEmojiGrid,
  parentOpen,
}: EmojiGridProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;

    if (isSmallViewport && !target.closest('#emoji-grid-toggle')) {
      return;
    }
    // If a user clicks the toggle button, we save their preference for later
    setOpenEmojiGrid(false);
  };

  return isSmallViewport ? (
    <EmojiGridMobile
      handleClickAway={handleClickAway}
      openEmojiGrid={openEmojiGrid}
      parentOpen={parentOpen}
    />
  ) : (
    <EmojiGridDesktop
      handleClickAway={handleClickAway}
      openEmojiGrid={openEmojiGrid}
      anchorRef={anchorRef}
    />
  );
};

export default EmojiGrid;
