import type { PropsWithChildren, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Card from '@ui/components/Card';
import Separator from '@components/Separator';
import meetingSchedule$ from '../../context/meetingScheduleContext';

/**
 * Today's "Prepare to join" card (name field, title, meeting name). The schedule block and Join go in `children`.
 */
const PrepareToJoinCard = ({ children }: PropsWithChildren): ReactElement => {
  const { t } = useTranslation();
  const username = meetingSchedule$.use.select((state) => state.username);
  const meetingName = meetingSchedule$.use.select((state) => state.meetingName);
  const { setUsername } = meetingSchedule$.use.actions();

  return (
    <Card component="form" className="flex w-full flex-col gap-4 lg:max-w-125">
      <Typography className="text-vera-text-secondary text-vera-heading-4!">
        {t('waitingRoom.user.input.title')}
      </Typography>
      <TextField
        fullWidth
        size="small"
        label={t('waitingRoom.user.input.label')}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        slotProps={{ htmlInput: { maxLength: 60 } }}
      />
      <Separator width="100%" />
      <Typography className="text-vera-text-secondary text-vera-heading-4!">
        {t('waitingRoom.title')}
      </Typography>
      <Typography className="text-vera-text-tertiary text-vera-heading-4!" noWrap>
        {meetingName}
      </Typography>
      {children}
    </Card>
  );
};

export default PrepareToJoinCard;
