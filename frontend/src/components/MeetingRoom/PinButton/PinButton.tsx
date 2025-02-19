import PushPinIcon from '@mui/icons-material/PushPin';
import { IconButton, Tooltip } from '@mui/material';
import { MouseEvent, ReactElement, useRef, useState } from 'react';
import PushPinOffIcon from '../../Icons/PushPinOffIcon';
import isMouseEventInsideBox from '../../../utils/isMouseEventInsideBox';

export type PinButtonProps = {
  isMaxPinned: boolean;
  isPinned: boolean;
  isTileHovered: boolean;
  participantName?: string;
  handleClick: (clickEvent: MouseEvent<HTMLButtonElement>) => void;
};

const PinButton = ({
  isMaxPinned,
  isPinned,
  isTileHovered,
  participantName,
  handleClick,
}: PinButtonProps): ReactElement | false => {
  const isDisabled = isMaxPinned && !isPinned;
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [isHoveringButton, setIsHoveringButton] = useState<boolean>(false);
  const iconSx = {
    fontSize: '18px',
    color: isDisabled ? 'rgba(255,255,255,.54)' : 'white',
    cursor: 'pointer',
  };

  const getTooltipText = () => {
    if (isDisabled) {
      return `You can't pin any more tiles`;
    }
    if (isPinned) {
      return `Unpin ${participantName}'s video`;
    }
    return `Pin ${participantName}'s video`;
  };

  const onClick = (clickEvent: MouseEvent<HTMLButtonElement>) => {
    handleClick(clickEvent);
    // We set hovering to false manually since onMouseLeave is not invoked when the DOM Element is moved.
    setIsHoveringButton(false);
    // In case the DOM Element didn't move, which can happen if pinning while viewing screenshare -
    // we use setTimeout to let the new layout render, then check if the element is still under the click event location.
    // If so we re-enable the hover state.
    setTimeout(() => {
      if (anchorRef.current) {
        const divRect = anchorRef.current.getBoundingClientRect();
        if (isMouseEventInsideBox(clickEvent, divRect)) {
          setIsHoveringButton(true);
        }
      }
    }, 0);
  };

  const shouldShowIcon = isTileHovered || isPinned;
  return (
    shouldShowIcon && (
      <div
        ref={anchorRef}
        className="flex rounded-xl absolute top-3 left-3 h-6 w-6 items-center justify-center m-auto"
        data-testid="pin-button"
        onPointerEnter={() => setIsHoveringButton(true)}
        onPointerLeave={() => setIsHoveringButton(false)}
        onBlur={() => setIsHoveringButton(false)}
      >
        <Tooltip title={getTooltipText()} disableFocusListener open={isHoveringButton}>
          <IconButton
            disabled={isDisabled}
            onClick={onClick}
            sx={{
              height: 24,
              width: 24,
              borderRadius: '50%',
              cursor: 'pointer',
              backgroundColor: isTileHovered ? 'rgb(32, 33, 36, .55)' : 'none',
              '&:hover, &.Mui-focusVisible': { backgroundColor: 'rgb(32, 33, 36, .75)' },
            }}
          >
            {isTileHovered && isPinned ? (
              <PushPinOffIcon sx={iconSx} />
            ) : (
              <PushPinIcon sx={iconSx} />
            )}
          </IconButton>
        </Tooltip>
      </div>
    )
  );
};

export default PinButton;
