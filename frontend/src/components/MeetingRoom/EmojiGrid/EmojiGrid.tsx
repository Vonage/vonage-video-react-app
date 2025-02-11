import { Grid, Grow, Paper, Popper, Tooltip } from '@mui/material';
import { EmojiEmotions } from '@mui/icons-material';
import { ReactElement, useRef } from 'react';
import { ClickAwayListener, PopperChildrenProps } from '@mui/base';
import ToolbarButton from '../ToolbarButton';
import emojiMap from '../../../utils/emojis';
import SendEmojiButton from '../SendEmojiButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import useSessionContext from '../../../hooks/useSessionContext';

/**
 * EmojiGrid Component
 *
 * Displays a clickable button that opens a grid of emojis.
 * @returns {ReactElement} - The EmojiGrid Component.
 */
const EmojiGrid = (): ReactElement => {
  const { openEmojiGrid, setOpenEmojiGrid } = useSessionContext();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const isSmallViewport = useIsSmallViewport();
  // We want 30px of buffer on the sides of the menu for mobile devices
  const minWidth = isSmallViewport ? `calc(100dvw - 30px)` : '100%';
  // Each button is 66px, 8px left and right padding = 280px for desktop
  const maxWidth = isSmallViewport ? 'calc(100dvw - 30px)' : '280px';
  const transform = isSmallViewport ? 'translate(-50%, -18px)' : 'translateY(-5%)';
  // We account for the 9px translation from the PopupMenuToggleButton.
  const left = isSmallViewport ? 'calc(50dvw - 9px)' : '';

  const handleClose = (event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;

    // If a user clicks the toggle button, we save their preference for later
    if (target.closest('#emoji-grid-toggle')) {
      setOpenEmojiGrid(false);
    }
  };

  const handleToggle = () => {
    setOpenEmojiGrid((prevOpen) => {
      const newOpen = !prevOpen;
      setOpenEmojiGrid(newOpen);

      return newOpen;
    });
  };

  return (
    <>
      <Tooltip title="Express yourself" aria-label="open sendable emoji menu">
        <ToolbarButton
          onClick={handleToggle}
          data-testid="emoji-grid-toggle"
          id="emoji-grid-toggle"
          icon={
            <EmojiEmotions
              style={{ color: `${!openEmojiGrid ? 'white' : 'rgb(138, 180, 248)'}` }}
            />
          }
          ref={anchorRef}
        />
      </Tooltip>

      <Popper
        open={openEmojiGrid}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        placement="top"
      >
        {({ TransitionProps, placement }: PopperChildrenProps) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <div className="font-normal text-left flex">
              <ClickAwayListener onClickAway={handleClose}>
                <Paper
                  className="flex justify-center items-center"
                  sx={{
                    backgroundColor: '#292D31',
                    color: '#fff',
                    padding: { xs: 1 },
                    borderRadius: 2,
                    zIndex: 1,
                    transform,
                    maxWidth,
                    left,
                    position: 'relative',
                  }}
                >
                  <Grid
                    container
                    spacing={0}
                    display={openEmojiGrid ? 'flex' : 'none'}
                    sx={{
                      width: minWidth,
                    }}
                  >
                    {Object.values(emojiMap).map((emoji) => {
                      return <SendEmojiButton key={emoji} emoji={emoji} />;
                    })}
                  </Grid>
                </Paper>
              </ClickAwayListener>
            </div>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default EmojiGrid;
