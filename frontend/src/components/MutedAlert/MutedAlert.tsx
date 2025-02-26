import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect, RefObject, ReactElement } from 'react';
import { Alert, Box } from '@mui/material';
import { MUTED_ALERT_MESSAGE, FORCE_MUTED_ALERT_MESSAGE } from '../../utils/constants';
import useSpeakingDetector from '../../hooks/useSpeakingDetector';
import usePublisherContext from '../../hooks/usePublisherContext';

export type MutedAlertProps = {
  anchorRef: RefObject<HTMLInputElement>;
};

/**
 * MutedAlert Component
 *
 * Displays a dismissible notification when the user is speaking while muted or has been muted by another participant.
 * @param {MutedAlertProps} props - The props for the component.
 *  @property {RefObject<HTMLInputElement>} anchorRef - The reference element for the MutedAlert component.
 * @returns {ReactElement} - The MutedAlert component.
 */
const MutedAlert = ({ anchorRef }: MutedAlertProps): ReactElement => {
  const { publisher, isAudioEnabled, isForceMuted } = usePublisherContext();
  const [open, setOpen] = useState<boolean>(true);
  const isSpeakingWhileMuted = useSpeakingDetector({
    isAudioEnabled,
    selectedMicrophoneId: publisher?.getAudioSource()?.id,
  });
  const theme = useTheme();

  // useEffect(() => {
  //   setOpen(isForceMuted || isSpeakingWhileMuted);
  // }, [isForceMuted, isSpeakingWhileMuted]);

  return (
    <Alert
      severity="warning"
      sx={{
        position: 'absolute',
        maxWidth: '300px',
        bottom: '96px',
      }}
    >
      <span>{MUTED_ALERT_MESSAGE}</span>
      <IconButton
        onClick={() => setOpen(false)}
        sx={{ color: '#fff', padding: 0, marginLeft: 1 }}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Alert>
  );

  // return (
  //   <Popper open={open} anchorEl={anchorRef.current} placement="top" transition>
  //     {({ TransitionProps }) => (
  //       <Fade {...TransitionProps} timeout={350}>
  //         <Paper
  //           sx={{
  //             p: 2,
  //             backgroundColor: 'rgb(60, 64, 67)',
  //             color: '#fff',
  //             maxWidth: 300,
  //             width: 'auto',
  //             borderRadius: 2,
  //             boxShadow: 3,
  //             fontSize: '0.875rem',
  //             transform: 'translateY(-10%) translateX(-40%)',
  //             // this is needed to center align on small devices
  //             [theme.breakpoints.down(700)]: {
  //               transform: 'translateY(-10%) translateX(25%)',
  //             },
  //           }}
  //         >
  //           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //             {/* {isForceMuted && <span>{FORCE_MUTED_ALERT_MESSAGE}</span>} */}
  //             <span>{MUTED_ALERT_MESSAGE}</span>
  //             <IconButton
  //               onClick={() => setOpen(false)}
  //               sx={{ color: '#fff', padding: 0, marginLeft: 1 }}
  //               size="small"
  //             >
  //               <CloseIcon fontSize="small" />
  //             </IconButton>
  //           </div>
  //         </Paper>
  //       </Fade>
  //     )}
  //   </Popper>
  // );
};

export default MutedAlert;
