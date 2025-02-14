import { Tooltip } from '@mui/material';
import { EmojiEmotions } from '@mui/icons-material';
import { Dispatch, ReactElement, SetStateAction, useRef } from 'react';
import ToolbarButton from '../ToolbarButton';
import EmojiGrid from '../EmojiGrid/EmojiGrid';

export type EmojiGridProps = {
  openEmojiGrid: boolean;
  setOpenEmojiGrid: Dispatch<SetStateAction<boolean>>;
};

/**
 * EmojiGridButton Component
 *
 * Displays a clickable button to open a grid of emojis.
 * @param {EmojiGridProps} props - the props for the component
 *  @property {boolean} openEmojiGrid - whether the component will be open initially
 *  @property {Dispatch<SetStateAction<boolean>>} setOpenEmojiGrid - toggle whether the emoji grid is shown or hidden
 * @returns {ReactElement} - The EmojiGridButton Component.
 */
const EmojiGridButton = ({ openEmojiGrid, setOpenEmojiGrid }: EmojiGridProps): ReactElement => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const handleToggle = () => {
    setOpenEmojiGrid((prevOpen) => !prevOpen);
  };

  return (
    <>
      <Tooltip title="Express yourself" aria-label="open sendable emoji menu">
        <ToolbarButton
          onClick={handleToggle}
          icon={
            <EmojiEmotions
              style={{ color: `${!openEmojiGrid ? 'white' : 'rgb(138, 180, 248)'}` }}
            />
          }
          ref={anchorRef}
          data-testid="emoji-grid-toggle"
        />
      </Tooltip>

      <EmojiGrid
        anchorRef={anchorRef}
        openEmojiGrid={openEmojiGrid}
        setOpenEmojiGrid={setOpenEmojiGrid}
      />
    </>
  );
};

export default EmojiGridButton;
