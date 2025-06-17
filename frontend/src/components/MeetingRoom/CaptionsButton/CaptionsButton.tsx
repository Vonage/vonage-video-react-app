import { ClosedCaption, ClosedCaptionDisabled } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { ReactElement, useState } from 'react';
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
  const { currentCaptionsIdRef, ownCaptions } = useSessionContext();
  const roomName = useRoomName();
  const [captionsId, setCaptionsId] = useState<string>('');
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState<boolean>(false);
  const title = isCaptionsEnabled ? 'Disable captions' : 'Enable captions';

  const handleClose = () => {
    // If the CaptionsButton is in the ToolbarOverflowMenu, we close the modal and the menu
    if (isOverflowButton && handleClick) {
      // Close the menu immediately to improve mobile UX
      handleClick();
    }
  };

  const handleCaptions = async (action: 'enable' | 'disable') => {
    if (action === 'enable') {
      if (currentCaptionsIdRef?.current) {
        setIsCaptionsEnabled(true);
        setCaptionsId(currentCaptionsIdRef.current);
      } else if (!captionsId && roomName) {
        try {
          const response = await enableCaptions(roomName);
          setCaptionsId(response.data.captions.captionsId);
          currentCaptionsIdRef.current = response.data.captions.captionsId;
          setIsCaptionsEnabled(true);
        } catch (err) {
          console.log(err);
        }
      }
    } else if (action === 'disable' && captionsId && roomName) {
      try {
        setIsCaptionsEnabled(false);
        setCaptionsId('');
        await disableCaptions(roomName, captionsId);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleActionClick = () => {
    // First handle captions toggle
    handleCaptions(isCaptionsEnabled ? 'disable' : 'enable');

    // Then close the menu if needed
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
