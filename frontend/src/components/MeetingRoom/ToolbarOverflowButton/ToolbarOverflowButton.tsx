import { ReactElement, useCallback, useRef, useState } from 'react';
import { Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ToolbarButton from '../ToolbarButton';
import ToolbarOverflowMenu from '../ToolbarOverflowMenu';

/**
 * ToolbarOverflowButton Component
 *
 * Displays a clickable button that opens a grid of hidden toolbar buttons for smaller viewport devices.
 * @returns {ReactElement} - The ToolbarOverflowButton Component.
 */
const ToolbarOverflowButton = (): ReactElement => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [openEmojiGridMobile, setOpenEmojiGridMobile] = useState<boolean>(true);
  const timer = useRef<number | undefined>(undefined);

  const handleButtonToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClickAway = useCallback(() => {
    setOpen(false);
    // We close the emoji grid so its animation is in-sync with the overflow menu animation.
    setOpenEmojiGridMobile((prevValue) => {
      if (timer.current === undefined) {
        timer.current = window.setTimeout(() => {
          setOpenEmojiGridMobile(prevValue);
          timer.current = undefined;
          // The default Transition timer is 250
        }, 250);
      }
      return false;
    });
  }, []);

  return (
    <>
      <Tooltip
        title="Access additional toolbar items"
        aria-label="open additional toolbar items menu"
      >
        <ToolbarButton
          data-testid="hidden-toolbar-items"
          onClick={handleButtonToggle}
          icon={<MoreVertIcon style={{ color: `${!open ? 'white' : 'rgb(138, 180, 248)'}` }} />}
          ref={anchorRef}
        />
      </Tooltip>
      <ToolbarOverflowMenu
        open={open}
        openEmojiGrid={openEmojiGridMobile}
        setOpenEmojiGrid={setOpenEmojiGridMobile}
        anchorRef={anchorRef}
        handleClickAway={handleClickAway}
      />
    </>
  );
};

export default ToolbarOverflowButton;
