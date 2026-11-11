import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import StackedInputField from '../../../../components/StackedInputField';
import createRoomWizard$ from '../../../context/createRoomWizardContext';

/**
 * Native date and time pickers for the start of the meeting.
 */
const StartDateTimeFields = (): ReactElement => {
  const { t } = useTranslation();
  const date = createRoomWizard$.use.select((state) => state.date);
  const time = createRoomWizard$.use.select((state) => state.time);
  const { setStart } = createRoomWizard$.use.actions();

  return (
    <>
      <StackedInputField
        type="date"
        id="mockup-meeting-date"
        label={t('meetingFlow.wizard.details.schedule.date')}
        value={date}
        onChange={(event) => setStart({ date: event.target.value, time })}
      />
      <StackedInputField
        type="time"
        id="mockup-meeting-time"
        label={t('meetingFlow.wizard.details.schedule.time')}
        value={time}
        onChange={(event) => setStart({ date, time: event.target.value })}
      />
    </>
  );
};

export default StartDateTimeFields;
