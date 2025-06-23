import { ClosedCaption, ClosedCaptionDisabled } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { Dispatch, ReactElement, useState, SetStateAction } from 'react';
import useRoomName from '../../../hooks/useRoomName';
import ToolbarButton from '../ToolbarButton';
import { disableCaptions, enableCaptions } from '../../../api/captions';
import { SubscriberWrapper } from '../../../types/session';
import CaptionsBox from './CaptionsBox';
import useSessionContext from '../../../hooks/useSessionContext';

export type CaptionsButtonProps = {
  isOverflowButton?: boolean;
  handleClick?: () => void;
  subscriberWrappers: SubscriberWrapper[];
  setIsSmallViewPortCaptionsEnabled?: Dispatch<SetStateAction<boolean>>;
};

/**
 * CaptionsButton Component
 *
 * Displays a button and handles the captioning functionality.
 * @param {CaptionsButtonProps} props - the props for the component
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 *  @property {(event?: MouseEvent | TouchEvent) => void} handleClick - (optional) click handler that closes the overflow menu in small viewports.
 *  @property {SubscriberWrapper[]} subscriberWrappers - an array of subscribers to display captions for.
 *  @property {Dispatch<SetStateAction<boolean>>} setIsSmallViewPortCaptionsEnabled - toggle captions on/off for small viewports
 * @returns {ReactElement} - The CaptionsButton component.
 */
const CaptionsButton = ({
  isOverflowButton = false,
  handleClick,
  subscriberWrappers,
  setIsSmallViewPortCaptionsEnabled,
}: CaptionsButtonProps): ReactElement => {
  const { ownCaptions } = useSessionContext();
  const roomName = useRoomName();
  const [captionsId, setCaptionsId] = useState<string>('');
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState<boolean>(false);
  const title = isCaptionsEnabled ? 'Disable captions' : 'Enable captions';

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
        setIsCaptionsEnabled(true);

        // for small viewports, we need to inform up to the MeetingRoom component that captions are enabled
        if (setIsSmallViewPortCaptionsEnabled) {
          setIsSmallViewPortCaptionsEnabled(true);
        }
      } catch (error) {
        console.log(error);
      }
    } else if (action === 'disable' && captionsId && roomName) {
      try {
        setIsCaptionsEnabled(false);
        setCaptionsId('');
        await disableCaptions(roomName, captionsId);

        // for small viewports, we need to inform up to the MeetingRoom component that captions are disabled
        if (setIsSmallViewPortCaptionsEnabled) {
          setIsSmallViewPortCaptionsEnabled(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleActionClick = () => {
    handleCaptions(isCaptionsEnabled ? 'disable' : 'enable');
    handleClose();
  };

  return (
    <>
      <Tooltip title={title} aria-label="video layout">
        <ToolbarButton
          onClick={handleActionClick}
          data-testid="captions-button"
          icon={
            !isCaptionsEnabled ? (
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
      {!isOverflowButton && (
        <CaptionsBox
          subscriberWrappers={subscriberWrappers}
          localPublisherCaptions={ownCaptions}
          isCaptioningEnabled={isCaptionsEnabled}
          isSmallViewPort={isOverflowButton}
        />
      )}
    </>
  );
};
export default CaptionsButton;
