import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Field from '@ui/components/Field';
import ChoiceChip from '../../../components/ChoiceChip';
import Notice from '../../../components/Notice';
import durationOptions from '../../constants/durationOptions';
import recurrenceOptions from '../../constants/recurrenceOptions';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import getDurationLabel from '../../helpers/getDurationLabel';
import MeetingNameField from './components/MeetingNameField';
import StartDateTimeFields from './components/StartDateTimeFields';

/**
 * Details variant B: a library switch turns the schedule on; duration and repeat are one-tap chips.
 */
const DetailsSwitchChips = (): ReactElement => {
  const { t } = useTranslation();
  const isScheduled = createRoomWizard$.use.select((state) => state.isScheduled);
  const durationMinutes = createRoomWizard$.use.select((state) => state.durationMinutes);
  const recurrence = createRoomWizard$.use.select((state) => state.recurrence);
  const { setScheduled, setDurationMinutes, setRecurrence } = createRoomWizard$.use.actions();

  return (
    <div className="flex flex-col gap-6">
      <MeetingNameField />
      <Field>
        <Field.Label htmlFor="mockup-schedule-switch">
          {t('meetingFlow.wizard.details.schedule.switch')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="mockup-schedule-switch"
          checked={isScheduled}
          onChange={(event) => setScheduled(event.currentTarget.checked)}
        />
        <Field.Description>
          {t('meetingFlow.wizard.details.schedule.description')}
        </Field.Description>
      </Field>
      {isScheduled ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <StartDateTimeFields />
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
              {t('meetingFlow.wizard.details.schedule.duration')}
            </span>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map((minutes) => (
                <ChoiceChip
                  key={minutes}
                  isSelected={minutes === durationMinutes}
                  onClick={() => setDurationMinutes(minutes)}
                >
                  {getDurationLabel({ minutes, t })}
                </ChoiceChip>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
              {t('meetingFlow.wizard.details.schedule.repeat')}
            </span>
            <div className="flex flex-wrap gap-2">
              {recurrenceOptions.map((option) => (
                <ChoiceChip
                  key={option}
                  isSelected={option === recurrence}
                  onClick={() => setRecurrence(option)}
                >
                  {t(`meetingFlow.recurrence.${option}`)}
                </ChoiceChip>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Notice tone="warning">
          {t('meetingFlow.wizard.details.schedule.unscheduledWarning')}
        </Notice>
      )}
    </div>
  );
};

export default DetailsSwitchChips;
