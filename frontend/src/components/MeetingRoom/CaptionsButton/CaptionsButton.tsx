import { ClosedCaption, ClosedCaptionDisabled } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { Dispatch, ReactElement, useState, SetStateAction } from 'react';
import useRoomName from '../../../hooks/useRoomName';
import ToolbarButton from '../ToolbarButton';
import { disableCaptions, enableCaptions } from '../../../api/captions';
import CaptionsBox from './CaptionsBox';

export type CaptionsButtonProps = {
  isOverflowButton?: boolean;
  handleClick?: () => void;
  isUserCaptionsEnabled: boolean;
  setIsUserCaptionsEnabled: Dispatch<SetStateAction<boolean>>;
};

/**
 * CaptionsButton Component
 *
 * Displays a button and handles the captioning functionality.
 * @param {CaptionsButtonProps} props - the props for the component
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 *  @property {(event?: MouseEvent | TouchEvent) => void} handleClick - (optional) click handler that closes the overflow menu in small viewports.
 *  @property {boolean} isUserCaptionsEnabled - whether captions are enabled
 *  @property {Dispatch<SetStateAction<boolean>>} setIsUserCaptionsEnabled - toggle captions on and off
 * @returns {ReactElement} - The CaptionsButton component.
 */
const CaptionsButton = ({
  isOverflowButton = false,
  handleClick,
  isUserCaptionsEnabled,
  setIsUserCaptionsEnabled,
}: CaptionsButtonProps): ReactElement => {
  const roomName = useRoomName();
  const [captionsId, setCaptionsId] = useState<string>('');
  const title = isUserCaptionsEnabled ? 'Disable captions' : 'Enable captions';

  const handleClose = () => {
    if (isOverflowButton && handleClick) {
      handleClick();
    }
  };

  const handleCaptions = async (action: 'enable' | 'disable') => {
    if (action === 'enable') {
      try {
        const response = await enableCaptions(roomName);
        setCaptionsId(response.data.captionsId);
        setIsUserCaptionsEnabled(true);
      } catch (error) {
        console.log(error);
      }
    } else if (action === 'disable' && captionsId && roomName) {
      try {
        setCaptionsId('');
        await disableCaptions(roomName, captionsId);
        setIsUserCaptionsEnabled(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleActionClick = () => {
    handleCaptions(isUserCaptionsEnabled ? 'disable' : 'enable');
    handleClose();
  };

  return (
    <>
      <Tooltip title={title} aria-label="video layout">
        <ToolbarButton
          onClick={handleActionClick}
          data-testid="captions-button"
          icon={
            !isUserCaptionsEnabled ? (
              <ClosedCaption style={{ color: 'white' }} />
            ) : (
              <ClosedCaptionDisabled
                style={{
                  color: 'rgb(239 68 68)',
                }}
              />
            )
          }
          sx={{
            marginTop: isOverflowButton ? '0px' : '4px',
          }}
          isOverflowButton={isOverflowButton}
        />
      </Tooltip>
      {!isOverflowButton && <CaptionsBox isCaptioningEnabled={isUserCaptionsEnabled} />}
    </>
  );
};
export default CaptionsButton;
