import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Field from '@ui/components/Field';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import MeetingNameField from './components/MeetingNameField';
import ScheduleFields from './components/ScheduleFields';

const DetailsStep = (): ReactElement => {
  const { t } = useTranslation();
  const isScheduled = createRoomWizard$.use.select((state) => state.isScheduled);
  const { setIsScheduled } = createRoomWizard$.use.actions();

  return (
    <div className="flex flex-col gap-6">
      <MeetingNameField />
      <Field>
        <Field.Label htmlFor="create-room-wizard-schedule-switch">
          {t('createRoomWizard.details.schedule.switch')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="create-room-wizard-schedule-switch"
          checked={isScheduled}
          onChange={(changeEvent) => setIsScheduled(changeEvent.currentTarget.checked)}
        />
        <Field.Description>{t('createRoomWizard.details.schedule.description')}</Field.Description>
      </Field>
      {isScheduled && <ScheduleFields />}
      {!isScheduled && (
        <p
          role="note"
          className="rounded-vera-medium border border-vera-warning bg-vera-warning/10 px-4 py-3 font-vera-plain text-vera-body-base text-vera-warning"
        >
          {t('createRoomWizard.details.schedule.unscheduledWarning')}
        </p>
      )}
    </div>
  );
};

export default DetailsStep;
