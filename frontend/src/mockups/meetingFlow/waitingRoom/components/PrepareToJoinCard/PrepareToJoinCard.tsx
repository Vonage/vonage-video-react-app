import { Children, type PropsWithChildren, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import Card from '@ui/components/Card';
import findSlotByDisplayName from '@ui/helpers/findSlotByDisplayName';
import Separator from '@components/Separator';
import meetingSchedule$ from '../../context/meetingScheduleContext';
import PrepareToJoinCardSlot from './components/PrepareToJoinCardSlot';
import { PrepareToJoinCardSlots } from './constants/prepareToJoinCardSlots';

/**
 * Waiting room card: the meeting identity on top, the join action below.
 */
const PrepareToJoinCard = ({ children }: PropsWithChildren): ReactElement => {
  const { t } = useTranslation();
  const childrenArray = Children.toArray(children);
  const username = meetingSchedule$.use.select((state) => state.username);
  const meetingName = meetingSchedule$.use.select((state) => state.meetingName);
  const { setUsername } = meetingSchedule$.use.actions();

  const schedule = findSlotByDisplayName({
    children: childrenArray,
    displayName: PrepareToJoinCardSlots.Schedule,
  });

  const actions = findSlotByDisplayName({
    children: childrenArray,
    displayName: PrepareToJoinCardSlots.Actions,
  });

  return (
    <Card component="form" className="flex w-full flex-col gap-6 p-6 md:p-10 lg:max-w-125">
      <div className="flex w-full flex-col gap-3">
        <h2 className="font-vera-plain text-vera-heading-2 text-vera-text-secondary">
          {meetingName}
        </h2>
        {schedule}
      </div>
      <Separator width="100%" />
      <div className="flex w-full flex-col gap-5">
        <TextField
          fullWidth
          size="small"
          label={t('waitingRoom.user.input.label')}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 60 } }}
        />
        {actions}
      </div>
    </Card>
  );
};

/**
 * Schedule and status of the meeting, directly under its name.
 */
PrepareToJoinCard.Schedule = PrepareToJoinCardSlot(PrepareToJoinCardSlots.Schedule);

/**
 * Join button and the options that belong to it.
 */
PrepareToJoinCard.Actions = PrepareToJoinCardSlot(PrepareToJoinCardSlots.Actions);

export default PrepareToJoinCard;
