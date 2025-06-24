import { ReactElement } from 'react';
import { Box } from '@mui/material';
import SingleCaption from './SingleCaption';
import useSessionContext from '../../../../hooks/useSessionContext';
import useIsSmallViewport from '../../../../hooks/useIsSmallViewport';

/**
 * CaptionsBox Component
 *
 * This component shows a list of the captions that are currently in the meeting room.
 * @returns {ReactElement} The captions box component.
 */
const CaptionsBox = (): ReactElement => {
  const { subscriberWrappers, ownCaptions } = useSessionContext();
  const isSmallViewPort = useIsSmallViewport();

  const sxBox = {
    position: 'absolute',
    bottom: isSmallViewPort ? 100 : 80,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    px: 2,
    py: isSmallViewPort ? 1 : 1.5,
    borderRadius: 2,
    width: isSmallViewPort ? '90vw' : 600,
    height: isSmallViewPort ? 150 : 200,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  };

  return (
    <Box data-testid="captions-box" sx={sxBox}>
      {ownCaptions && (
        <SingleCaption
          key="local-publisher"
          subscriber={null}
          isSmallViewPort={isSmallViewPort}
          caption={ownCaptions}
        />
      )}
      {(subscriberWrappers ?? []).map((wrapper, idx) => (
        <SingleCaption
          key={wrapper.subscriber?.id || idx}
          subscriber={wrapper.subscriber}
          isSmallViewPort={isSmallViewPort}
        />
      ))}
    </Box>
  );
};

export default CaptionsBox;
