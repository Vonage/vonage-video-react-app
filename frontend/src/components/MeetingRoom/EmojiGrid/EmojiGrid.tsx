import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import classNames from 'classnames';
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

  const widthClassName = useMemo(() => {
    if (isSmallViewport) {
      return 'w-[calc(100dvw-30px)] max-w-[calc(100dvw-30px)]';
    }

    // Each button is 66px, 8px left and right padding = 280px
    return 'w-[280px] max-w-[280px]';
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
          <Box className="flex text-left font-normal">
            <ClickAwayListener onClickAway={handleClickAway}>
              <Paper
                data-testid="emoji-grid"
                className={classNames(
                  'relative z-1 mx-4 flex -translate-y-[5%] items-center justify-center rounded-vera-medium! bg-vera-dark-grey-opacity! p-2 text-vera-on-dark-grey',
                  widthClassName
                )}
              >
                <div className="flex w-full flex-wrap">
                  {Object.values(emojiMap).map((emoji) => (
                    <SendEmojiButton key={emoji} emoji={emoji} />
                  ))}
                </div>
              </Paper>
            </ClickAwayListener>
          </Box>
        </Grow>
      )}
    </Popper>
  );
};

export default EmojiGrid;
