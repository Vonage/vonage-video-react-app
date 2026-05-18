import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import {
  Dispatch,
  ReactElement,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import SendEmojiButton from '../SendEmojiButton';
import emojiMap from '../../../utils/emojis';

export type EmojiGridProps = {
  isEmojiGridOpen: boolean;
  setIsEmojiGridOpen: Dispatch<SetStateAction<boolean>>;
  anchorRef: RefObject<HTMLButtonElement | null>;
  isParentOpen: boolean;
};

/**
 * EmojiGrid Component
 *
 * Displays a grid of emojis.
 * @param {EmojiGridProps} props - the props for the component
 *  @property {RefObject<HTMLButtonElement | null>} anchorRef - the button ref for the grid
 *  @property {boolean} isEmojiGridOpen - whether the component will be open initially
 *  @property {Dispatch<SetStateAction<boolean>>} setIsEmojiGridOpen - toggle whether the emoji grid is shown or hidden
 *  @property {boolean} isParentOpen - whether the ToolbarOverflowMenu is open
 * @returns {ReactElement} - The EmojiGrid Component.
 */
const EmojiGrid = ({
  anchorRef,
  isEmojiGridOpen,
  setIsEmojiGridOpen,
  isParentOpen,
}: EmojiGridProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();

  const [isAnchorReady, setIsAnchorReady] = useState<boolean>(false);

  useEffect(() => {
    if (!anchorRef.current) {
      return;
    }

    setIsAnchorReady(true);
  }, [anchorRef]);

  const maxWidth = useMemo(() => {
    if (isSmallViewport) {
      return 'calc(100dvw - 30px)';
    }

    // Each button is 66px, 8px left and right padding = 280px
    return '280px';
  }, [isSmallViewport]);

  const handleClickAway = () => {
    setIsEmojiGridOpen(false);
  };

  const isOpen = isParentOpen && isEmojiGridOpen && isAnchorReady;

  return (
    <Popper open={isOpen} anchorEl={anchorRef.current} transition disablePortal placement="bottom">
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              textAlign: 'left',
              fontWeight: 'normal',
            }}
          >
            <ClickAwayListener onClickAway={handleClickAway}>
              <Paper
                data-testid="emoji-grid"
                className="bg-vera-dark-grey-opacity! text-vera-on-dark-grey"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: { xs: 1 },
                  borderRadius: 2,
                  zIndex: 1,
                  transform: 'translateY(-5%)',
                  width: maxWidth,
                  maxWidth,
                  mx: 2,
                  position: 'relative',
                }}
              >
                <Grid container spacing={0} sx={{ width: '100%' }}>
                  {Object.values(emojiMap).map((emoji) => (
                    <SendEmojiButton key={emoji} emoji={emoji} />
                  ))}
                </Grid>
              </Paper>
            </ClickAwayListener>
          </Box>
        </Grow>
      )}
    </Popper>
  );
};

export default EmojiGrid;
