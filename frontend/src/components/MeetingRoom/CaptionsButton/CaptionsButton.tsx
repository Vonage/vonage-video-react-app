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
 *  @property {SubscriberWrapper[]} subscriberWrappers - an array of subscribers to display captions for.
 * @returns {ReactElement} - The CaptionsButton component.
 */
const CaptionsButton = ({
  isOverflowButton = false,
  handleClick,
  subscriberWrappers,
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
        setCaptionsId(response.data.captions.captionsId);
        setIsCaptionsEnabled(true);
      } catch (err) {
        console.log(err);
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
