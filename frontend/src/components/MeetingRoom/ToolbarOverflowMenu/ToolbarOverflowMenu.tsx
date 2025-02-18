import { ClickAwayListener, PopperChildrenProps } from '@mui/base';
import { Grow, Paper, Popper } from '@mui/material';
import { Dispatch, ReactElement, RefObject, SetStateAction } from 'react';
import ArchivingToggle from '../ArchivingToggle';
import EmojiGridButton from '../EmojiGridButton';
import LayoutToggleButton from '../LayoutToggleButton';
import useSessionContext from '../../../hooks/useSessionContext';

export type ToolbarOverflowMenuProps = {
  open: boolean;
  openEmojiGrid: boolean;
  setOpenEmojiGrid: Dispatch<SetStateAction<boolean>>;
  anchorRef: RefObject<HTMLButtonElement | null>;
  handleClickAway: () => void;
};

/**
 * ToolbarOverflowMenu Component
 *
 * Displays a menu holding buttons that cannot be displayed on the toolbar due to a narrow device viewport width.
 * @param {ToolbarOverflowMenuProps} props - the props for the component
 *  @property {boolean} open - whether the component will be open
 *  @property {boolean} openEmojiGrid - whether the emoji grid will be open
 *  @property {Dispatch<SetStateAction<boolean>>} setOpenEmojiGrid - toggle whether the emoji grid is shown or hidden
 *  @property {RefObject<HTMLButtonElement | null>} anchorRef - the button ref for the menu
 *  @property {() => void} handleClickAway - hides the menu when user clicks away from the menu
 * @returns {ReactElement} - The ToolbarOverflowMenu component.
 */
const ToolbarOverflowMenu = ({
  open,
  openEmojiGrid,
  setOpenEmojiGrid,
  anchorRef,
  handleClickAway,
}: ToolbarOverflowMenuProps): ReactElement => {
  const { subscriberWrappers } = useSessionContext();
  const isViewingScreenShare = subscriberWrappers.some((subWrapper) => subWrapper.isScreenshare);

  return (
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
            <ClickAwayListener onClickAway={handleClickAway}>
              <Paper
                data-testid="toolbar-overflow-menu"
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
                  openEmojiGrid={openEmojiGrid}
                  setOpenEmojiGrid={setOpenEmojiGrid}
                />
                <ArchivingToggle />
              </Paper>
            </ClickAwayListener>
          </div>
        </Grow>
      )}
    </Popper>
  );
};

export default ToolbarOverflowMenu;
