import { Box, Grid, Grow, Paper, Popper, Portal } from '@mui/material';
import { Dispatch, ReactElement, RefObject, SetStateAction } from 'react';
import { ClickAwayListener, PopperChildrenProps } from '@mui/base';
import emojiMap from '../../../utils/emojis';
import SendEmojiButton from '../SendEmojiButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type EmojiGridProps = {
  openEmojiGrid: boolean;
  setOpenEmojiGrid: Dispatch<SetStateAction<boolean>>;
  anchorRef: RefObject<HTMLButtonElement | null>;
  parentOpen: boolean;
};

/**
 * EmojiGrid Component
 *
 * Displays a grid of emojis.
 * @param {EmojiGridProps} props - the props for the component
 *  @property {RefObject<HTMLButtonElement | null>} anchorRef - the button ref for the grid
 *  @property {boolean} openEmojiGrid - whether the component will be open initially
 *  @property {Dispatch<SetStateAction<boolean>>} setOpenEmojiGrid - toggle whether the emoji grid is shown or hidden
 *  @property {boolean} parentOpen - whether the ToolbarOverflowMenu is open
 * @returns {ReactElement} - The EmojiGrid Component.
 */
const EmojiGrid = ({
  anchorRef,
  openEmojiGrid,
  setOpenEmojiGrid,
  parentOpen,
}: EmojiGridProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;

    if (isSmallViewport && !target.closest('#emoji-grid-toggle')) {
      return;
    }
    // If a user clicks the toggle button, we save their preference for later
    setOpenEmojiGrid(false);
  };

  return isSmallViewport ? (
    <Portal>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Grow
          in={parentOpen && openEmojiGrid}
          style={{
            transformOrigin: 'center bottom',
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              bottom: '146px',
              left: '50%',
              translate: '-50% 0%',
            }}
          >
            <Grid
              container
              spacing={0}
              display={openEmojiGrid ? 'flex' : 'none'}
              sx={{
                width: 'calc(100dvw - 30px)',
                backgroundColor: '#272c2f',
                borderRadius: 2,
              }}
            >
              {Object.values(emojiMap).map((emoji) => (
                <SendEmojiButton key={emoji} emoji={emoji} />
              ))}
            </Grid>
          </Box>
        </Grow>
      </ClickAwayListener>
    </Portal>
  ) : (
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
          <div className="flex text-left font-normal">
            <ClickAwayListener onClickAway={handleClickAway}>
              <Paper
                className="flex items-center justify-center"
                data-testid="emoji-grid"
                sx={{
                  backgroundColor: 'rgb(32, 33, 36)',
                  color: '#fff',
                  padding: { xs: 1 },
                  borderRadius: 2,
                  zIndex: 1,
                  transform: 'translateY(-5%)',
                  // Each button is 66px, 8px left and right padding = 280px
                  maxWidth: '280px',
                  position: 'relative',
                }}
              >
                <Grid
                  container
                  spacing={0}
                  display={openEmojiGrid ? 'flex' : 'none'}
                  sx={{
                    width: '100%',
                  }}
                >
                  {Object.values(emojiMap).map((emoji) => (
                    <SendEmojiButton key={emoji} emoji={emoji} />
                  ))}
                </Grid>
              </Paper>
            </ClickAwayListener>
          </div>
        </Grow>
      )}
    </Popper>
  );
};

export default EmojiGrid;
