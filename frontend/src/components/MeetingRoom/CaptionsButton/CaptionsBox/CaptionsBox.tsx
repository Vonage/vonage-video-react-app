import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import UserCaption from './UserCaption';
import useSessionContext from '../../../../hooks/useSessionContext';
import useIsSmallViewport from '../../../../hooks/useIsSmallViewport';
import useTheme from '@ui/theme';

/**
 * CaptionsBox Component
 *
 * This component renders the captions of the speakers in the meeting room.
 * @returns {ReactElement} The captions box component.
 */
const CaptionsBox = (): ReactElement => {
  const { subscriberWrappers, ownCaptions } = useSessionContext();
  const isSmallViewPort = useIsSmallViewport();
  const theme = useTheme();

  const sxBox = {
    position: 'absolute',
    bottom: isSmallViewPort ? 100 : 80,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: theme.colors.darkGreyOpacity,
    color: theme.colors.onDarkGrey,
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
        <UserCaption
          key="local-publisher"
          subscriber={null}
          isSmallViewPort={isSmallViewPort}
          caption={ownCaptions}
        />
      )}
      {(subscriberWrappers ?? []).map((wrapper, idx) => (
        <UserCaption
          key={wrapper.subscriber?.id || idx}
          subscriber={wrapper.subscriber}
          isSmallViewPort={isSmallViewPort}
        />
      ))}
    </Box>
  );
};

export default CaptionsBox;
