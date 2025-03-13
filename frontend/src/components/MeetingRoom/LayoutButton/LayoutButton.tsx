import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import Tooltip from '@mui/material/Tooltip';
import WindowIcon from '@mui/icons-material/Window';
import { ReactElement } from 'react';
import useSessionContext from '../../../hooks/useSessionContext';
import ToolbarButton from '../ToolbarButton';

export type LayoutButtonProps = {
  isScreenSharePresent: boolean;
  isPinningPresent: boolean;
  isOverflowButton?: boolean;
};

/**
 * LayoutButton Component
 *
 * Displays a button to toggle the meeting room layout for the user between `grid` and `active-speaker`.
 * @param {LayoutButtonProps} props - the props for the component.
 *  @property {boolean} isScreenSharePresent - Indicates whether there is a screenshare currently in the session.
 *  @property {boolean} isPinningPresent - Indicates whether there is a participant currently pinned.
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement} The LayoutButton component.
 */
const LayoutButton = ({
  isScreenSharePresent,
  isPinningPresent,
  isOverflowButton = false,
}: LayoutButtonProps): ReactElement => {
  const { layoutMode, setLayoutMode } = useSessionContext();
  const isGrid = layoutMode === 'grid';
  const isDisabled = isScreenSharePresent || isPinningPresent;

  const handleClick = () => {
    if (isDisabled) {
      return;
    }
    setLayoutMode((prev) => (prev === 'grid' ? 'active-speaker' : 'grid'));
  };

  const getTooltipTitle = () => {
    if (isScreenSharePresent) {
      return 'Cannot switch layout while screen share is active';
    }
    if (isPinningPresent) {
      return 'Cannot switch layout while a participant is pinned';
    }
    return isGrid ? 'Switch to Active Speaker layout' : 'Switch to Grid layout';
  };

  return (
    <Tooltip title={getTooltipTitle()} aria-label="video layout">
      <ToolbarButton
        onClick={handleClick}
        data-testid="layout-button"
        icon={
          !isGrid ? (
            <ViewSidebarIcon className={isDisabled ? 'text-gray-500' : 'text-white'} />
          ) : (
            <WindowIcon className={isDisabled ? 'text-gray-500' : 'text-white'} />
          )
        }
        sx={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          // on the small view port devices we need to align the button
          marginTop: isOverflowButton ? '0px' : '4px',
        }}
        isOverflowButton={isOverflowButton}
      />
    </Tooltip>
  );
};

export default LayoutButton;
