import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import SelectField from '@ui/components/SelectField';
import durationOptions from '../../../constants/durationOptions';
import recurrenceOptions from '../../../constants/recurrenceOptions';
import createRoomWizard$ from '../../../context/createRoomWizardContext';
import getDurationLabel from '../../../helpers/getDurationLabel';

/**
 * Duration and repeat, as the library SelectField used in Advanced settings.
 */
const DurationAndRepeatSelects = (): ReactElement => {
  const { t } = useTranslation();
  const durationMinutes = createRoomWizard$.use.select((state) => state.durationMinutes);
  const recurrence = createRoomWizard$.use.select((state) => state.recurrence);
  const { setDurationMinutes, setRecurrence } = createRoomWizard$.use.actions();

  return (
    <>
      <SelectField
        id="mockup-meeting-duration"
        label={t('meetingFlow.wizard.details.schedule.duration')}
        value={durationMinutes}
        options={durationOptions.map((minutes) => ({
          value: minutes,
          label: getDurationLabel({ minutes, t }),
        }))}
        onChange={setDurationMinutes}
      />
      <SelectField
        id="mockup-meeting-repeat"
        label={t('meetingFlow.wizard.details.schedule.repeat')}
        value={recurrence}
        options={recurrenceOptions.map((option) => ({
          value: option,
          label: t(`meetingFlow.recurrence.${option}`),
        }))}
        onChange={setRecurrence}
      />
    </>
  );
};

export default DurationAndRepeatSelects;
