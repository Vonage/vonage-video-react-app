import PushPinIcon from '@mui/icons-material/PushPin';
import { IconButton, Tooltip } from '@mui/material';
import { ReactElement, useEffect, useRef, useState } from 'react';
import PushPinOffIcon from '../../Icons/PushPinOffIcon';

export type PinButtonProps = {
  color?: string;
  isMaxPinned: boolean;
  isPinned: boolean;
  participantName?: string;
  pinStyle?: string;
  toggleIsPinned: () => void;
};

const isInsideBox = (mouseEvent: MouseEvent, rect: DOMRect) => {
  if (
    mouseEvent.x >= rect.x &&
    mouseEvent.x <= rect.x + rect.width &&
    mouseEvent.y >= rect.y &&
    mouseEvent.y <= rect.y + rect.height
  ) {
    return true;
  }
  return false;
};

const PinButton = ({
  color,
  isMaxPinned,
  isPinned,
  participantName,
  pinStyle,
  toggleIsPinned,
}: PinButtonProps): ReactElement | false => {
  const isDisabled = isMaxPinned && !isPinned;
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const eventRef = useRef<((this: Document, ev: MouseEvent) => void) | null>(null);
  const [isHoveringButton, setIsHoveringButton] = useState<boolean>(false);
  const iconSx = {
    fontSize: '18px',
    color: isDisabled ? 'rgba(255,255,255,.54)' : color,
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

  useEffect(() => {
    if (!eventRef.current) {
      eventRef.current = (mouseMoveEvent) => {
        if (eventRef.current) {
          document.removeEventListener('mousemove', eventRef.current);
        }
        if (anchorRef.current) {
          const divRect = anchorRef.current.getBoundingClientRect();
          if (!isInsideBox(mouseMoveEvent, divRect)) {
            setIsHoveringButton(false);
          }
        }
      };
    }
  }, []);

  const handleClick = () => {
    toggleIsPinned();
    if (eventRef.current) {
      document.addEventListener('mousemove', eventRef.current);
    }
  };

  return (
    <div
      ref={anchorRef}
      className={pinStyle}
      data-testid="pin-button"
      onPointerEnter={() => setIsHoveringButton(true)}
      onPointerLeave={() => setIsHoveringButton(false)}
      onBlur={() => setIsHoveringButton(false)}
    >
      <Tooltip title={getTooltipText()} disableFocusListener open={isHoveringButton}>
        <IconButton
          disabled={isDisabled}
          onClick={handleClick}
          sx={{
            height: 24,
            width: 24,
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        >
          {isHoveringButton && isPinned ? (
            <PushPinOffIcon sx={iconSx} />
          ) : (
            <PushPinIcon sx={iconSx} />
          )}
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default PinButton;
