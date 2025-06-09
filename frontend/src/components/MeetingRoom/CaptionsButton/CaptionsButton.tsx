import { ClosedCaption, ClosedCaptionDisabled } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { ReactElement, useState } from 'react';
import { AxiosError } from 'axios';
import useRoomName from '../../../hooks/useRoomName';
import ToolbarButton from '../ToolbarButton';
import { enableCaptions } from '../../../api/captions';
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
  const { currentCaptionsIdRef, ownCaptions, vonageVideoClient } = useSessionContext();
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

        // we need to signal to other users that we are joining the captions
        // This is to ensure that if the captions are already enabled, we just join them
        // and not create a new captions session
        vonageVideoClient?.signal({
          type: 'captions',
          data: JSON.stringify({
            action: 'join',
            captionsId: currentCaptionsIdRef.current,
          }),
        });
      } else if (!captionsId && roomName) {
        try {
          // For a new joiner, request status of the captions from others before trying to enable
          if (vonageVideoClient) {
            vonageVideoClient.signal({
              type: 'captions',
              data: JSON.stringify({
                action: 'request-status',
              }),
            });

            // Wait for a half a second to allow the status request to be processed
            await new Promise<void>((resolve) => {
              setTimeout(resolve, 500);
            });

            if (currentCaptionsIdRef.current) {
              // If we received a captions ID from the status request, we can join it
              // but we do not set isCaptionsEnabled to true here since user has not explicitly enabled captions
              setCaptionsId(currentCaptionsIdRef.current);
              return;
            }
          }

          const response = await enableCaptions(roomName);
          setCaptionsId(response.data.captions.captionsId);
          currentCaptionsIdRef.current = response.data.captions.captionsId;
          setIsCaptionsEnabled(true);

          // we need to signal to other users that captions have been enabled
          vonageVideoClient?.signal({
            type: 'captions',
            data: JSON.stringify({
              action: 'enable',
              captionsId: response.data.captions.captionsId,
            }),
          });
        } catch (err: unknown) {
          const error = err as AxiosError;
          console.log(err);

          // The most likely case is that captions are already enabled by another user
          if (error.response && error.response.status === 500) {
            // Request status one more time to get the captions ID
            if (vonageVideoClient) {
              vonageVideoClient.signal({
                type: 'captions',
                data: JSON.stringify({
                  action: 'request-status',
                }),
              });
            }
          }
        }
      }
    } else if (captionsId && roomName) {
      try {
        setIsCaptionsEnabled(false);
        setCaptionsId('');

        // we need to signal to other users that we are leaving the captions
        vonageVideoClient?.signal({
          type: 'captions',
          data: JSON.stringify({
            action: 'leave',
            captionsId,
          }),
        });
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
          isCaptionsEnabled={isCaptionsEnabled}
          isMobileView={isOverflowButton}
        />
      )}
    </>
  );
};
export default CaptionsButton;
