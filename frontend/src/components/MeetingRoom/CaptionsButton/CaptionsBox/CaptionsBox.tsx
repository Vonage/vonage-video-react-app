import { ReactElement } from 'react';
import { Box } from '@mui/material';
import SingleCaption from './SingleCaption';
import { SubscriberWrapper } from '../../../../types/session';

export type CaptionsBoxType = {
  subscriberWrappers: SubscriberWrapper[];
  isCaptionsEnabled: boolean;
};

/**
 * CaptionsBox Component
 *
 * This component shows a list of the captions that are currently in the meeting room.
 * @param {CaptionsBoxType} props - the props for the component.
 *  @property {SubscriberWrapper[]} subscriberWrappers - an array of subscriber wrappers.
 * @returns {ReactElement} The captions box component.
 */
const CaptionsBox = ({
  subscriberWrappers,
  isCaptionsEnabled,
}: CaptionsBoxType): ReactElement | null => {
  // Check if captions are enabled and if there are any subscribers
  if (!isCaptionsEnabled || subscriberWrappers.length === 0) {
    return null;
  }

  return (
    <Box
      data-testid="captions-box"
      sx={{
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        px: 2,
        py: 1.5,
        borderRadius: 2,
        width: 600,
        height: 100,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      {(subscriberWrappers ?? []).map((wrapper, idx) => (
        <SingleCaption key={wrapper.subscriber?.id || idx} subscriber={wrapper.subscriber} />
      ))}
    </Box>
  );
};

export default CaptionsBox;
