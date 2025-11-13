import { Grid, Grow, Paper, Popper, ClickAwayListener } from '@mui/material';
import { ReactElement, RefObject, useEffect, useState } from 'react';
import SendEmojiButton from '../SendEmojiButton';
import emojiMap from '@utils/emojis';
import { colors } from '@utils/customTheme/customTheme';
import { PopperChildrenProps } from '@mui/material/Popper/BasePopper.types';

export type EmojiGridDesktopProps = {
  handleClickAway: (event: MouseEvent | TouchEvent) => void;
  isEmojiGridOpen: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
};

/**
 * EmojiGridDesktop Component
 *
 * Displays a grid of emojis for devices with larger viewports.
 * @param {EmojiGridDesktopProps} props - the props for the component
 *  @property {(event: MouseEvent | TouchEvent) => void} handleClickAway - handles clicking away from the emoji grid
 *  @property {boolean} isEmojiGridOpen - whether the component is open
 *  @property {RefObject<HTMLButtonElement | null>} anchorRef - the button ref for the grid
 * @returns {ReactElement | false} - The EmojiGridDesktop Component
 */

const EmojiGridDesktop = ({
  handleClickAway,
  isEmojiGridOpen,
  anchorRef,
}: EmojiGridDesktopProps): ReactElement | false => {
  const [isRendered, setIsRendered] = useState<boolean>(false);
  useEffect(() => {
    // useRef is not immediately assigned on first render
    // We ensure the component renders only after the anchorRef is assigned
    if (anchorRef.current) {
      setIsRendered(true);
    }
  }, [anchorRef]);

  return (
    isRendered && (
      <Popper
        open={isEmojiGridOpen}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        placement="bottom"
      >
        {({ TransitionProps, placement }: PopperChildrenProps) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <div className="flex text-left font-normal">
              <ClickAwayListener onClickAway={handleClickAway}>
                <Paper
                  className="flex items-center justify-center"
                  data-testid="emoji-grid"
                  sx={{
                    backgroundColor: colors.darkGrey,
                    color: colors.onPrimary,
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
                    display={isEmojiGridOpen ? 'flex' : 'none'}
                    sx={{ width: '100%' }}
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
    )
  );
};

export default EmojiGridDesktop;
