import { ReactElement, useRef, useState } from 'react';
import { Grow, Paper, Popper, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ClickAwayListener, PopperChildrenProps } from '@mui/base';
import ToolbarButton from '../ToolbarButton';
import ArchivingToggle from '../ArchivingToggle';
import EmojiGrid from '../EmojiGrid';
import LayoutToggleButton from '../LayoutToggleButton';
import useSessionContext from '../../../hooks/useSessionContext';
import EmojiGridButton from '../EmojiGridButton';

/**
 * PopupMenuToggleButton Component
 *
 * Displays a clickable button that opens a grid of hidden toolbar buttons for smaller viewport devices.
 * @returns {ReactElement} - The PopupMenuToggleButton Component.
 */
const PopupMenuToggleButton = (): ReactElement => {
  const { subscriberWrappers } = useSessionContext();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const isViewingScreenShare = subscriberWrappers.some((subWrapper) => subWrapper.isScreenshare);
  const emojiGridButtonRefMobile = useRef<HTMLButtonElement>(null);
  const [openEmojiGridMobile, setOpenEmojiGridMobile] = useState<boolean>(true);

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <>
      <Tooltip
        title="Access additional toolbar items"
        aria-label="open additional toolbar items menu"
      >
        <ToolbarButton
          data-testid="hidden-toolbar-items"
          onClick={handleToggle}
          icon={<MoreVertIcon style={{ color: `${!open ? 'white' : 'rgb(138, 180, 248)'}` }} />}
          ref={anchorRef}
        />
      </Tooltip>

      <Popper open={open} anchorEl={anchorRef.current} transition disablePortal placement="bottom">
        {({ TransitionProps, placement }: PopperChildrenProps) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              width: 'calc(100dvw - 30px)',
              left: '-15px',
              position: 'relative',
              translate: '0px -9px',
            }}
          >
            <div className="font-normal text-left flex w-full">
              <ClickAwayListener onClickAway={handleClose}>
                <Paper
                  className="flex justify-center items-center"
                  sx={{
                    backgroundColor: '#272c2f',
                    color: '#fff',
                    padding: { xs: 1 },
                    borderRadius: 2,
                    zIndex: 1,
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignContent: 'space-between',
                    alignItems: 'center',
                    paddingLeft: '12px',
                  }}
                >
                  <LayoutToggleButton isScreenSharePresent={isViewingScreenShare} />
                  <EmojiGridButton
                    anchorRef={emojiGridButtonRefMobile}
                    openEmojiGrid={openEmojiGridMobile}
                    setOpenEmojiGrid={setOpenEmojiGridMobile}
                  />
                  <EmojiGrid
                    anchorRef={emojiGridButtonRefMobile}
                    openEmojiGrid={openEmojiGridMobile}
                    setOpenEmojiGrid={setOpenEmojiGridMobile}
                  />
                  <ArchivingToggle />
                </Paper>
              </ClickAwayListener>
            </div>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default PopupMenuToggleButton;
