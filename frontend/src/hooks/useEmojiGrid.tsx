import { Dispatch, SetStateAction, useState } from 'react';

/**
 * UseEmojiGrid Type
 * @param {boolean} openEmojiGrid - whether the emoji grid should be open or closed
 * @param {Dispatch<SetStateAction<boolean>>} setOpenEmojiGrid - function to update the `openEmojiGrid` state
 */
export type UseEmojiGrid = {
  setOpenEmojiGrid: Dispatch<SetStateAction<boolean>>;
  openEmojiGrid: boolean;
};

/**
 * React hook managing the state for the emoji grid.
 * @returns {UseEmojiGrid} - collection of state and update methods
 */
const useEmojiGrid = (): UseEmojiGrid => {
  const [openEmojiGrid, setOpenEmojiGrid] = useState<boolean>(true);

  return {
    openEmojiGrid,
    setOpenEmojiGrid,
  };
};

export default useEmojiGrid;
