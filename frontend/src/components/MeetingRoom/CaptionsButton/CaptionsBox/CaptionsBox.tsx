import { ReactElement } from 'react';
import { Box } from '@mui/material';
import SingleCaption from './SingleCaption';
import { SubscriberWrapper } from '../../../../types/session';

export type CaptionsBoxType = {
  subscriberWrappers: SubscriberWrapper[];
  isCaptionsEnabled: boolean;
  isMobileView: boolean;
  localPublisherCaptions?: string | null;
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
  isMobileView = false,
  localPublisherCaptions,
}: CaptionsBoxType): ReactElement | null => {
  if (!isCaptionsEnabled) {
    return null;
  }

  const sxBox = {
    position: 'absolute',
    bottom: isMobileView ? 100 : 80,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    px: 2,
    py: isMobileView ? 1 : 1.5,
    borderRadius: 2,
    width: isMobileView ? '90vw' : 600,
    height: isMobileView ? 150 : 200,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  };

  return (
    <Box data-testid="captions-box" sx={sxBox}>
      {localPublisherCaptions && (
        <SingleCaption
          key="local-publisher"
          subscriber={null}
          isMobileView={isMobileView}
          caption={localPublisherCaptions}
        />
      )}
      {(subscriberWrappers ?? []).map((wrapper, idx) => (
        <SingleCaption
          key={wrapper.subscriber?.id || idx}
          subscriber={wrapper.subscriber}
          isMobileView={isMobileView}
        />
      ))}
    </Box>
  );
};

export default CaptionsBox;
