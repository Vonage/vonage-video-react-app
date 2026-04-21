import { ReactElement, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import useElementDimensions from '../../../hooks/useElementDimensions';
import Subscriber from '../../Subscriber';
import type { SubscriberWrapper } from '../../../types/session';
import FloatingPipSelfView from './FloatingPipSelfView';

export type FloatingPipLayoutProps = {
  remoteSubscriber: SubscriberWrapper;
};

/**
 * FloatingPipLayout
 *
 * Renders the remote participant full-bleed with the local self view as a
 * draggable, corner-snapping overlay. Engaged automatically by
 * `useIsFloatingPipLayoutActive` when the session is a 1:1 call on a small
 * viewport with no screenshare.
 */
const FloatingPipLayout = ({ remoteSubscriber }: FloatingPipLayoutProps): ReactElement => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const canvasDimensions = useElementDimensions({ elementRef: canvasRef });

  const remoteBox = useMemo(
    () =>
      canvasDimensions && canvasDimensions.width > 0 && canvasDimensions.height > 0
        ? {
            left: 0,
            top: 0,
            width: canvasDimensions.width,
            height: canvasDimensions.height,
          }
        : undefined,
    [canvasDimensions]
  );

  return (
    <Box
      ref={canvasRef}
      data-testid="floating-pip-layout"
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: theme.colors.darkBackground,
      }}
    >
      <Box
        data-testid={`floating-pip-remote-${remoteSubscriber.id}`}
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          backgroundColor: theme.colors.darkGrey,
        }}
      >
        <Subscriber
          subscriberWrapper={remoteSubscriber}
          isHidden={false}
          box={remoteBox}
          isActiveSpeaker
          fit="cover"
        />
      </Box>
      <FloatingPipSelfView canvasRef={canvasRef} />
    </Box>
  );
};

export default FloatingPipLayout;
