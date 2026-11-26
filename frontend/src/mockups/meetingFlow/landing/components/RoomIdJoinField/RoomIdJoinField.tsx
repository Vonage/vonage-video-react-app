import { useState, type ComponentProps, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { twMerge } from 'tailwind-merge';

export type RoomIdJoinFieldProps = ComponentProps<'div'>;

/**
 * "Room id" input with its join button, stacked like the current JoinExistingRoom.
 */
const RoomIdJoinField = ({ className, ...props }: RoomIdJoinFieldProps): ReactElement => {
  const { t } = useTranslation();
  const [roomId, setRoomId] = useState('');

  return (
    <div className={twMerge('flex w-full flex-col gap-6', className)} {...props}>
      <TextField
        size="small"
        fullWidth
        id="mockup-room-id"
        label={t('meetingFlow.landing.roomId.label')}
        helperText={t('meetingFlow.landing.roomId.helper')}
        value={roomId}
        onChange={(event) => setRoomId(event.target.value)}
      />
      <Button variant="outlined" type="button">
        {t('button.joinWaitingRoom')}
      </Button>
    </div>
  );
};

export default RoomIdJoinField;
