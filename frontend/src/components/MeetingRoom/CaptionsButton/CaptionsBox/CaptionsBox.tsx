import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import UserCaption from './UserCaption';
import useSessionContext from '../../../../hooks/useSessionContext';
import useIsSmallViewport from '../../../../hooks/useIsSmallViewport';
import { useTranslation } from 'react-i18next';

/**
 * CaptionsBox Component
 *
 * This component renders the captions of the speakers in the meeting room.
 * @returns {ReactElement} The captions box component.
 */
const CaptionsBox = (): ReactElement => {
  const { t } = useTranslation();
  const { subscriberWrappers, ownCaptionsSubscriber } = useSessionContext();
  const isSmallViewPort = useIsSmallViewport();

  const sxBox = {
    position: 'absolute',
    bottom: isSmallViewPort ? 100 : 80,
    left: '50%',
    transform: 'translateX(-50%)',
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
    <Box
      data-testid="captions-box"
      className="bg-vera-dark-grey-opacity text-vera-on-dark-grey"
      sx={sxBox}
    >
      {ownCaptionsSubscriber && (
        <UserCaption
          key="local-publisher"
          subscriber={ownCaptionsSubscriber}
          speakerName={t('user.you')}
          isSmallViewPort={isSmallViewPort}
        />
      )}
      {(subscriberWrappers ?? []).map((wrapper) => (
        <UserCaption
          key={wrapper.id}
          subscriber={wrapper.subscriber}
          speakerName={wrapper.subscriber.stream?.name ?? ''}
          isSmallViewPort={isSmallViewPort}
        />
      ))}
    </Box>
  );
};

export default CaptionsBox;
