import { ReactElement, useRef, useState } from 'react';
import { Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ToolbarButton from '../ToolbarButton';
import ToolbarOverflowMenu from '../ToolbarOverflowMenu';
import UnreadMessagesBadge from '../UnreadMessagesBadge';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type ToolbarOverflowButtonProps = {
  toggleShareScreen: () => void;
  isSharingScreen: boolean;
};

/**
 * ToolbarOverflowButton Component
 *
 * Displays a clickable button that opens a grid of hidden toolbar buttons for smaller viewports. There
 * is also an unread chat messages indicator that is shown when there are messages to be read.
 * @param root0
 * @param root0.toggleShareScreen
 * @param root0.isSharingScreen
 * @returns {ReactElement | null} - The ToolbarOverflowButton Component.
 */
const ToolbarOverflowButton = ({
  toggleShareScreen,
  isSharingScreen,
}: ToolbarOverflowButtonProps): ReactElement | null => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [isToolbarOverflowMenuOpen, setIsToolbarOverflowMenuOpen] = useState<boolean>(false);
  const [openEmojiGridMobile, setOpenEmojiGridMobile] = useState<boolean>(true);
  const isSmallViewport = useIsSmallViewport();

  const handleButtonToggle = () => {
    setIsToolbarOverflowMenuOpen((prevOpen) => !prevOpen);
  };

  const handleClickAway = () => {
    setIsToolbarOverflowMenuOpen(false);
  };

  return isSmallViewport ? (
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
        toggleShareScreen={toggleShareScreen}
        isSharingScreen={isSharingScreen}
      />
    </>
  ) : null;
};

export default ToolbarOverflowButton;
