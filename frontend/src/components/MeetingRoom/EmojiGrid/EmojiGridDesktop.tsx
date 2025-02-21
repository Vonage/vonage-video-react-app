import { Grid, Grow, Paper, Popper } from '@mui/material';
import { ReactElement, RefObject } from 'react';
import { ClickAwayListener, PopperChildrenProps } from '@mui/base';
import SendEmojiButton from '../SendEmojiButton';
import emojiMap from '../../../utils/emojis';

export type EmojiGridDesktopProps = {
  handleClickAway: (event: MouseEvent | TouchEvent) => void;
  openEmojiGrid: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
};

/**
 * EmojiGridDesktop Component
 *
 * Displays a grid of emojis for devices with larger viewports.
 * @param {EmojiGridDesktopProps} props - the props for the component
 *  @property {(event: MouseEvent | TouchEvent) => void} handleClickAway - handles clicking away from the emoji grid
 *  @property {boolean} openEmojiGrid - whether the component is open
 *  @property {RefObject<HTMLButtonElement | null>} anchorRef - the button ref for the grid
 * @returns {ReactElement} - The EmojiGridDesktop Component
 */

const EmojiGridDesktop = ({
  handleClickAway,
  openEmojiGrid,
  anchorRef,
}: EmojiGridDesktopProps): ReactElement => (
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

export default EmojiGridDesktop;
