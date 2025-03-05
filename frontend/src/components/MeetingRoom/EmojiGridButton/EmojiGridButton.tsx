import { Tooltip } from '@mui/material';
import { EmojiEmotions } from '@mui/icons-material';
import { Dispatch, ReactElement, SetStateAction, useRef } from 'react';
import ToolbarButton from '../ToolbarButton';
import EmojiGrid from '../EmojiGrid/EmojiGrid';

export type EmojiGridProps = {
  isEmojiGridOpen: boolean;
  setIsEmojiGridOpen: Dispatch<SetStateAction<boolean>>;
  isParentOpen: boolean;
  isOverflowButton?: boolean;
};

/**
 * EmojiGridButton Component
 *
 * Displays a clickable button to open a grid of emojis.
 * @param {EmojiGridProps} props - the props for the component
 *  @property {boolean} isEmojiGridOpen - whether the component will be open initially
 *  @property {Dispatch<SetStateAction<boolean>>} setIsEmojiGridOpen - toggle whether the emoji grid is shown or hidden
 *  @property {boolean} isParentOpen - whether the ToolbarOverflowMenu is open
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement} - The EmojiGridButton Component.
 */
const EmojiGridButton = ({
  isEmojiGridOpen,
  setIsEmojiGridOpen,
  isParentOpen,
  isOverflowButton = false,
}: EmojiGridProps): ReactElement => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const handleToggle = () => {
    setIsEmojiGridOpen((prevOpen) => !prevOpen);
  };

  return (
    <>
      <Tooltip title="Express yourself" aria-label="open sendable emoji menu">
        <ToolbarButton
          onClick={handleToggle}
          icon={
            <EmojiEmotions
              style={{ color: `${!isEmojiGridOpen ? 'white' : 'rgb(138, 180, 248)'}` }}
            />
          }
          ref={anchorRef}
          data-testid="emoji-grid-button"
          sx={{
            marginTop: isOverflowButton ? '0px' : '4px',
          }}
          isOverflowButton={isOverflowButton}
        />
      </Tooltip>

      <EmojiGrid
        anchorRef={anchorRef}
        isEmojiGridOpen={isEmojiGridOpen}
        setIsEmojiGridOpen={setIsEmojiGridOpen}
        isParentOpen={isParentOpen}
      />
    </>
  );
};

export default EmojiGridButton;
