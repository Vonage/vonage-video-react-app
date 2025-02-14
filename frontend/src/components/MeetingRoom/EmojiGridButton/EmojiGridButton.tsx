import { Tooltip } from '@mui/material';
import { EmojiEmotions } from '@mui/icons-material';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import ToolbarButton from '../ToolbarButton';

export type EmojiGridProps = {
  anchorRef: MutableRefObject<HTMLButtonElement | null>;
  openEmojiGrid: boolean;
  setOpenEmojiGrid: Dispatch<SetStateAction<boolean>>;
};

const EmojiGridButton = ({ anchorRef, openEmojiGrid, setOpenEmojiGrid }: EmojiGridProps) => {
  const handleToggle = () => {
    setOpenEmojiGrid((prevOpen) => !prevOpen);
  };

  return (
    <Tooltip title="Express yourself" aria-label="open sendable emoji menu">
      <ToolbarButton
        onClick={handleToggle}
        icon={
          <EmojiEmotions style={{ color: `${!openEmojiGrid ? 'white' : 'rgb(138, 180, 248)'}` }} />
        }
        ref={anchorRef}
        data-testid="emoji-grid-toggle"
      />
    </Tooltip>
  );
};

export default EmojiGridButton;
