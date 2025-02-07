import PushPinIcon from '@mui/icons-material/PushPin';
import { IconButton, Tooltip } from '@mui/material';
import { ReactElement, useEffect, useRef, useState } from 'react';
import PushPinOffIcon from '../../Icons/PushPinOffIcon';

export type PinButtonProps = {
  color?: string;
  isPinned: boolean;
  isTileHovered: boolean;
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
  isPinned,
  isTileHovered,
  participantName,
  pinStyle,
  toggleIsPinned,
}: PinButtonProps): ReactElement | false => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const eventRef = useRef<((this: Document, ev: MouseEvent) => void) | null>(null);
  const [isHoveringButton, setIsHoveringButton] = useState<boolean>(false);
  const iconSx = {
    fontSize: '18px',
    color,
    cursor: 'pointer',
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
      <Tooltip
        title={isPinned ? `Unpin ${participantName}'s video` : `Pin ${participantName}'s video`}
        disableFocusListener
        open={isHoveringButton}
      >
        <IconButton
          onClick={handleClick}
          sx={{
            height: 24,
            width: 24,
            borderRadius: '50%',
            cursor: 'pointer',
          }}
        >
          {isTileHovered && isPinned ? <PushPinOffIcon sx={iconSx} /> : <PushPinIcon sx={iconSx} />}
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default PinButton;
