import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import SelectField from '@ui/components/SelectField';
import VividIcon from '@ui/components/VividIcon';
import Notice from '../../../components/Notice';
import formatMeetingDate from '../../../helpers/formatMeetingDate';
import useLocale from '../../../hooks/useLocale';
import durationOptions from '../../constants/durationOptions';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import getDurationLabel from '../../helpers/getDurationLabel';
import useDraftSchedule from '../../hooks/useDraftSchedule';
import MeetingNameField from './components/MeetingNameField';
import StartDateTimeFields from './components/StartDateTimeFields';

type WhenMode = 'anytime' | 'once' | 'repeating';

/**
 * Details variant C: one "When" select drives the form, and a live sentence confirms what was picked.
 */
const DetailsWhenSelect = (): ReactElement => {
  const { t } = useTranslation();
  const locale = useLocale();
  const schedule = useDraftSchedule();
  const durationMinutes = createRoomWizard$.use.select((state) => state.durationMinutes);
  const recurrence = createRoomWizard$.use.select((state) => state.recurrence);
  const { setScheduled, setRecurrence, setDurationMinutes } = createRoomWizard$.use.actions();

  const whenMode: WhenMode = (() => {
    if (schedule === null) return 'anytime';
    if (recurrence === 'none') return 'once';
    return 'repeating';
  })();

  const handleWhenChange = (mode: WhenMode) => {
    setScheduled(mode !== 'anytime');
    setRecurrence(mode === 'repeating' ? 'weekly' : 'none');
  };

  return (
    <div className="flex flex-col gap-6">
      <MeetingNameField />
      <SelectField
        id="mockup-meeting-when"
        label={t('meetingFlow.wizard.details.when.label')}
        value={whenMode}
        options={(['anytime', 'once', 'repeating'] as WhenMode[]).map((mode) => ({
          value: mode,
          label: t(`meetingFlow.wizard.details.when.${mode}`),
        }))}
        onChange={handleWhenChange}
      />
      {schedule === null ? (
        <Notice tone="warning">
          {t('meetingFlow.wizard.details.schedule.unscheduledWarning')}
        </Notice>
      ) : (
        <>
          <div className="grid grid-cols-2 items-end gap-4 sm:grid-cols-3">
            <StartDateTimeFields />
            <SelectField
              id="mockup-meeting-duration-compact"
              label={t('meetingFlow.wizard.details.schedule.duration')}
              value={durationMinutes}
              options={durationOptions.map((minutes) => ({
                value: minutes,
                label: getDurationLabel({ minutes, t }),
              }))}
              onChange={setDurationMinutes}
            />
            {whenMode === 'repeating' && (
              <SelectField
                id="mockup-meeting-repeat-compact"
                label={t('meetingFlow.wizard.details.schedule.repeat')}
                value={recurrence}
                options={(['daily', 'weekly', 'monthly'] as const).map((option) => ({
                  value: option,
                  label: t(`meetingFlow.recurrence.${option}`),
                }))}
                onChange={setRecurrence}
              />
            )}
          </div>
          <div className="flex items-center gap-3 rounded-vera-medium bg-vera-background px-4 py-3">
            <VividIcon
              name="calendar-check-line"
              customSize={-5}
              style={{ color: 'var(--vera-text-primary)', flexShrink: 0 }}
            />
            <span className="font-vera-plain text-vera-body-base text-vera-text-secondary">
              {[
                formatMeetingDate({ date: schedule.startsAt, locale, format: 'dateTime' }),
                getDurationLabel({ minutes: schedule.durationMinutes, t }),
                t(`meetingFlow.recurrence.${schedule.recurrence}`),
              ].join(' · ')}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default DetailsWhenSelect;
