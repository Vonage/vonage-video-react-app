import { AlertTitle, Box, Dialog, Stack, Alert } from '@mui/material';
import { ReactElement } from 'react';
import { DEVICE_ACCESS_STATUS } from '../../utils/constants';
import { isWebKit } from '../../utils/util';

const askDeviceMessage =
  'To join the video room, your browser will request access to your camera and microphone.';
const deniedDeviceMessage =
  "It seems your browser is blocked from accessing your camera and/or microphone. Reset the permission state through your browser's UI.";

export type DeviceAccessAlertProps = {
  accessStatus: string | null;
};

/**
 * A component that displays an alert message asking the user to grant permissions
 * or informing them that they have declined the permissions.
 * @param {DeviceAccessAlertProps} props - the props for the component.
 *  @property {string | null} accessStatus - the current access status.
 * @returns {ReactElement | false} - The rendered DeviceAccessAlert component if not Safari
 */
const DeviceAccessAlert = ({ accessStatus }: DeviceAccessAlertProps): ReactElement | false => {
  const messageToDisplay =
    accessStatus === DEVICE_ACCESS_STATUS.PENDING ? askDeviceMessage : deniedDeviceMessage;
  const imgToDisplay =
    accessStatus === DEVICE_ACCESS_STATUS.PENDING
      ? '/images/access-dialog-pending.png'
      : '/images/access-dialog-rejected.png';
  const severity = accessStatus === DEVICE_ACCESS_STATUS.PENDING ? 'success' : 'error';

  return (
    !isWebKit() && (
      <Stack
        sx={{
          width: '40%',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          alignItems: 'center',
          padding: 2,
          borderRadius: 2,
        }}
        spacing={3}
      >
        {accessStatus && (
          <Dialog open>
            <Alert severity={severity} variant="outlined" sx={{ width: '100%' }}>
              <AlertTitle>{messageToDisplay}</AlertTitle>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Box
                  component="img"
                  src={imgToDisplay}
                  alt="Access Dialog"
                  sx={{ maxWidth: 300, borderRadius: 1 }}
                />
              </Box>
            </Alert>
          </Dialog>
        )}
      </Stack>
    )
  );
};

export default DeviceAccessAlert;
