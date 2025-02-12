import { Grid, Grow, Paper, Popper, Tooltip } from '@mui/material';
import { EmojiEmotions } from '@mui/icons-material';
import { Dispatch, ReactElement, SetStateAction, useRef } from 'react';
import { ClickAwayListener, PopperChildrenProps } from '@mui/base';
import ToolbarButton from '../ToolbarButton';
import emojiMap from '../../../utils/emojis';
import SendEmojiButton from '../SendEmojiButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type EmojiGridProps = {
  openEmojiGrid: boolean;
  setOpenEmojiGrid: Dispatch<SetStateAction<boolean>>;
};

/**
 * EmojiGrid Component
 *
 * Displays a clickable button that opens a grid of emojis.
 * @param {EmojiGridProps} props - the props for the component
 *  @property {boolean} openEmojiGrid - whether the component will be open initially
 *  @property {Dispatch<SetStateAction<boolean>>} setOpenEmojiGrid - toggle whether the emoji grid is shown or hidden
 * @returns {ReactElement} - The EmojiGrid Component.
 */
const EmojiGrid = ({ openEmojiGrid, setOpenEmojiGrid }: EmojiGridProps): ReactElement => {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const isSmallViewport = useIsSmallViewport();
  // We want 30px of buffer on the sides of the menu for mobile devices
  const minWidth = isSmallViewport ? `calc(100dvw - 30px)` : '264px';
  // Each button is 66px, 8px left and right padding = 280px for desktop
  const maxWidth = isSmallViewport ? 'calc(100dvw - 30px)' : '280px';
  const transform = isSmallViewport ? 'translate(-50%, -18px)' : 'translateY(-5%)';
  // We account for the 9px translation from the PopupMenuToggleButton.
  const left = isSmallViewport ? 'calc(50dvw - 9px)' : '';

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;

    if (isSmallViewport && !target.closest('#emoji-grid-toggle')) {
      return;
    }
    // If a user clicks the toggle button, we save their preference for later
    setOpenEmojiGrid(false);
  };

  const handleToggle = () => {
    setOpenEmojiGrid((prevOpen) => !prevOpen);
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
        placement="bottom"
      >
        {({ TransitionProps, placement }: PopperChildrenProps) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <div className="font-normal text-left flex">
              <ClickAwayListener onClickAway={handleClickAway}>
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
