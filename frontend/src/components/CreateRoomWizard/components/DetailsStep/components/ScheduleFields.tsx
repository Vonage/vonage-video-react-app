import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ChoiceChip from '@ui/components/ChoiceChip';
import Field from '@ui/components/Field';
import createRoomWizard$ from '../../../context/createRoomWizardContext';
import meetingDurationOptions from '../../../constants/meetingDurationOptions';
import meetingDurationLabelKeys from '../../../constants/meetingDurationLabelKeys';
import useIsMeetingStartValid from '../../../hooks/useIsMeetingStartValid';

/**
 * Start date, start time and duration of a scheduled meeting.
 */
const ScheduleFields = (): ReactElement => {
  const { t } = useTranslation();
  const startDate = createRoomWizard$.use.select((state) => state.startDate);
  const startTime = createRoomWizard$.use.select((state) => state.startTime);
  const durationMinutes = createRoomWizard$.use.select((state) => state.durationMinutes);
  const { setStart, setDurationMinutes } = createRoomWizard$.use.actions();
  const isStartValid = useIsMeetingStartValid();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Field.Label htmlFor="create-room-wizard-start-date">
              {t('createRoomWizard.details.schedule.date')}
            </Field.Label>
            <Field.Input
              type="date"
              id="create-room-wizard-start-date"
              value={startDate}
              aria-invalid={!isStartValid}
              onChange={(changeEvent) =>
                setStart({ startDate: changeEvent.target.value, startTime })
              }
            />
          </Field>
          <Field>
            <Field.Label htmlFor="create-room-wizard-start-time">
              {t('createRoomWizard.details.schedule.time')}
            </Field.Label>
            <Field.Input
              type="time"
              id="create-room-wizard-start-time"
              value={startTime}
              aria-invalid={!isStartValid}
              onChange={(changeEvent) =>
                setStart({ startDate, startTime: changeEvent.target.value })
              }
            />
          </Field>
        </div>
        {!isStartValid && (
          <p role="alert" className="font-vera-plain text-vera-body-base text-vera-error">
            {t('createRoomWizard.details.schedule.startInPast')}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {t('createRoomWizard.details.schedule.duration')}
        </span>
        <div className="flex flex-wrap gap-2">
          {meetingDurationOptions.map((minutes) => (
            <ChoiceChip
              key={minutes}
              isSelected={minutes === durationMinutes}
              onClick={() => setDurationMinutes(minutes)}
            >
              {t(meetingDurationLabelKeys[minutes])}
            </ChoiceChip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleFields;
