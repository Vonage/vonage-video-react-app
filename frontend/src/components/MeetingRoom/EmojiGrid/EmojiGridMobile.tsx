import Box from '@ui/Box';
import Grid from '@ui/Grid';
import Grow from '@ui/Grow';
import Portal from '@ui/Portal';
import ClickAwayListener from '@ui/ClickAwayListener';
import { ReactElement } from 'react';
import SendEmojiButton from '../SendEmojiButton';
import emojiMap from '../../../utils/emojis';
import useTheme from '@ui/theme';

export type EmojiGridMobileProps = {
  handleClickAway: (event: MouseEvent | TouchEvent) => void;
  isEmojiGridOpen: boolean;
  isToolbarOpen: boolean;
};

/**
 * EmojiGridMobile Component
 *
 * Displays a grid of emojis for devices with small viewports.
 * @param {EmojiGridMobileProps} props - the props for the component
 *  @property {(event: MouseEvent | TouchEvent) => void} handleClickAway - handles clicking away from the emoji grid
 *  @property {boolean} isEmojiGridOpen - whether the component is open
 *  @property {boolean} isToolbarOpen - whether the ToolbarOverflowMenu is open
 * @returns {ReactElement} - The EmojiGridMobile Component
 */
const EmojiGridMobile = ({
  handleClickAway,
  isToolbarOpen,
  isEmojiGridOpen,
}: EmojiGridMobileProps): ReactElement => {
  const theme = useTheme();

  return (
    <Portal>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Grow
          in={isToolbarOpen && isEmojiGridOpen}
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
              display={isEmojiGridOpen ? 'flex' : 'none'}
              sx={{
                width: 'calc(100dvw - 30px)',
                backgroundColor: theme.colors.darkGreyOpacity,
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
  );
};

export default EmojiGridMobile;
