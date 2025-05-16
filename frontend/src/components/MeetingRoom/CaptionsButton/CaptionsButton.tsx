import { ClosedCaption, ClosedCaptionDisabled } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { ReactElement, useState } from 'react';
import useRoomName from '../../../hooks/useRoomName';
import ToolbarButton from '../ToolbarButton';
import { enableCaptions, disableCaptions } from '../../../api/captions/routes';
import { SubscriberWrapper } from '../../../types/session';
import CaptionsBox from './CaptionsBox';
import useSessionContext from '../../../hooks/useSessionContext';

export type CaptionsButtonProps = {
  isOverflowButton?: boolean;
  handleClick?: () => void;
  subscriberWrappers: SubscriberWrapper[];
};

/**
 * CaptionsButton Component
 *
 * Displays a button and handles the captioning functionality.
 * @param {CaptionsButtonProps} props - the props for the component
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 *  @property {(event?: MouseEvent | TouchEvent) => void} handleClick - (optional) click handler that closes the overflow menu in small viewports.
 * @returns {ReactElement} - The CaptionsButton component.
 */
const CaptionsButton = ({
  isOverflowButton = false,
  handleClick,
  subscriberWrappers,
}: CaptionsButtonProps): ReactElement => {
  const { currentCaptionsIdRef } = useSessionContext();
  const roomName = useRoomName();
  const [captionsId, setCaptionsId] = useState<string>('');
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState<boolean>(false);
  const title = isCaptionsEnabled ? 'Disable captions' : 'Enable captions';

  const handleClose = () => {
    // If the CaptionsButton is in the ToolbarOverflowMenu, we close the modal and the menu
    if (isOverflowButton && handleClick) {
      setTimeout(() => {
        handleClick();
      }, 1000); // brief delay to allow the user to see that the captions were enabled/disabled
    }
  };

  const handleCaptions = async (action: 'enable' | 'disable') => {
    if (action === 'enable') {
      if (!captionsId && roomName) {
        try {
          const response = await enableCaptions(roomName);
          setCaptionsId(response.data.captions.captionsId);
          currentCaptionsIdRef.current = response.data.captions.captionsId;
          setIsCaptionsEnabled(true);
        } catch (err) {
          console.log(err);
        }
      }
    } else if (captionsId && roomName) {
      try {
        await disableCaptions(roomName, captionsId);
        setCaptionsId('');
        setIsCaptionsEnabled(false);
        currentCaptionsIdRef.current = null;
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleActionClick = () => {
    handleClose();

    handleCaptions(isCaptionsEnabled ? 'disable' : 'enable');
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
      <CaptionsBox subscriberWrappers={subscriberWrappers} isCaptionsEnabled={isCaptionsEnabled} />
    </>
  );
};
export default CaptionsButton;
