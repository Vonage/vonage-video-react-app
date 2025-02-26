import { ReactElement, useRef, useState } from 'react';
import { Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ToolbarButton from '../ToolbarButton';
import ToolbarOverflowMenu from '../ToolbarOverflowMenu';
import UnreadMessagesBadge from '../UnreadMessagesBadge';

/**
 * ToolbarOverflowButton Component
 *
 * Displays a clickable button that opens a grid of hidden toolbar buttons for smaller viewport devices. There
 * is also an unread chat messages indicator that is shown when there are messages to be read.
 * @returns {ReactElement} - The ToolbarOverflowButton Component.
 */
const ToolbarOverflowButton = (): ReactElement => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [isToolbarOverflowMenuOpen, setIsToolbarOverflowMenuOpen] = useState<boolean>(false);
  const [openEmojiGridMobile, setOpenEmojiGridMobile] = useState<boolean>(true);

  const handleButtonToggle = () => {
    setIsToolbarOverflowMenuOpen((prevOpen) => !prevOpen);
  };

  const handleClickAway = () => {
    setIsToolbarOverflowMenuOpen(false);
  };

  return (
    <>
      <Tooltip
        title="Access additional toolbar items"
        aria-label="open additional toolbar items menu"
      >
        <UnreadMessagesBadge>
          <ToolbarButton
            data-testid="hidden-toolbar-items"
            onClick={handleButtonToggle}
            icon={
              <MoreVertIcon
                style={{ color: `${!isToolbarOverflowMenuOpen ? 'white' : 'rgb(138, 180, 248)'}` }}
              />
            }
            ref={anchorRef}
            sx={{
              marginRight: '0px',
            }}
          />
        </UnreadMessagesBadge>
      </Tooltip>
      <ToolbarOverflowMenu
        isToolbarOverflowMenuOpen={isToolbarOverflowMenuOpen}
        isEmojiGridOpen={openEmojiGridMobile}
        setIsEmojiGridOpen={setOpenEmojiGridMobile}
        anchorRef={anchorRef}
        handleClickAway={handleClickAway}
      />
    </>
  );
};

export default ToolbarOverflowButton;
