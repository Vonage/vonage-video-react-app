import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import Tooltip from '@mui/material/Tooltip';
import WindowIcon from '@mui/icons-material/Window';
import { ReactElement } from 'react';
import useSessionContext from '../../../hooks/useSessionContext';
import ToolbarButton from '../ToolbarButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

type LayoutToggleButtonProps = {
  isScreenSharePresent: boolean;
};

/**
 * LayoutToggleButton Component
 *
 * Displays a button to toggle the meeting room layout for the user between `grid` and `active-speaker`.
 * @param {boolean} isScreenSharePresent - Indicates whether there is a screenshare currently in the session.
 * @returns {ReactElement} The LayoutToggleButton component.
 */
const LayoutToggleButton = ({ isScreenSharePresent }: LayoutToggleButtonProps): ReactElement => {
  const { layoutMode, setLayoutMode } = useSessionContext();
  const isGrid = layoutMode === 'grid';

  const handleClick = () => {
    if (isScreenSharePresent) {
      return;
    }
    setLayoutMode((prev) => (prev === 'grid' ? 'active-speaker' : 'grid'));
  };

  const getTooltipTitle = () => {
    if (isScreenSharePresent) {
      return 'Cannot switch layout while screen share is active';
    }
    return isGrid ? 'Switch to Active Speaker layout' : 'Switch to Grid layout';
  };

  const isSmallViewport = useIsSmallViewport();

  return (
    <Tooltip title={getTooltipTitle()} aria-label="video layout">
      <ToolbarButton
        onClick={handleClick}
        data-testid="layout-toggle"
        icon={
          !isGrid ? (
            <ViewSidebarIcon className={isScreenSharePresent ? 'text-gray-500' : 'text-white'} />
          ) : (
            <WindowIcon className={isScreenSharePresent ? 'text-gray-500' : 'text-white'} />
          )
        }
        sx={{
          cursor: isScreenSharePresent ? 'not-allowed' : 'pointer',
        }}
        isSmallViewPort={isSmallViewport}
      />
    </Tooltip>
  );
};

export default LayoutToggleButton;
