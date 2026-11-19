import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Notice from '../../../components/Notice';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import DurationAndRepeatSelects from './components/DurationAndRepeatSelects';
import MeetingNameField from './components/MeetingNameField';
import ScheduleModeCard from './components/ScheduleModeCard';
import StartDateTimeFields from './components/StartDateTimeFields';

/**
 * Details variant A: two radio cards choose between no schedule and a schedule; the fields sit in a grid.
 */
const DetailsChoiceCards = (): ReactElement => {
  const { t } = useTranslation();
  const isScheduled = createRoomWizard$.use.select((state) => state.isScheduled);
  const { setScheduled } = createRoomWizard$.use.actions();

  return (
    <div className="flex flex-col gap-6">
      <MeetingNameField />
      <div className="flex flex-col gap-3">
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {t('meetingFlow.wizard.details.schedule.title')}
        </span>
        <div role="radiogroup" className="flex flex-col gap-3 sm:flex-row">
          <ScheduleModeCard
            isSelected={!isScheduled}
            icon="infinity-line"
            title={t('meetingFlow.wizard.details.schedule.none.title')}
            description={t('meetingFlow.wizard.details.schedule.none.description')}
            onClick={() => setScheduled(false)}
          />
          <ScheduleModeCard
            isSelected={isScheduled}
            icon="calendar-line"
            title={t('meetingFlow.wizard.details.schedule.set.title')}
            description={t('meetingFlow.wizard.details.schedule.set.description')}
            onClick={() => setScheduled(true)}
          />
        </div>
      </div>
      {isScheduled ? (
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
          <StartDateTimeFields />
          <DurationAndRepeatSelects />
        </div>
      ) : (
        <Notice tone="warning">
          {t('meetingFlow.wizard.details.schedule.unscheduledWarning')}
        </Notice>
      )}
    </div>
  );
};

export default DetailsChoiceCards;
