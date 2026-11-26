import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import useMeetingWhenLabel from '../../../../hooks/useMeetingWhenLabel';
import createRoomWizard$ from '../../../context/createRoomWizardContext';
import useDraftSchedule from '../../../hooks/useDraftSchedule';

/**
 * Confirmation heading of the share step: meeting name, when, and how long the link lasts.
 */
const ShareMeetingHeader = (): ReactElement => {
  const { t } = useTranslation();
  const name = createRoomWizard$.use.select((state) => state.name);
  const schedule = useDraftSchedule();
  const whenLabel = useMeetingWhenLabel(schedule);

  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-vera-success/10">
        <VividIcon
          name="check-circle-line"
          customSize={-4}
          style={{ color: 'var(--vera-success)' }}
        />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {name || t('meetingFlow.wizard.share.title')}
        </span>
        <span className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
          {whenLabel}
        </span>
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {schedule
            ? t('meetingFlow.wizard.share.description')
            : t('meetingFlow.wizard.share.descriptionUnscheduled')}
        </span>
      </div>
    </div>
  );
};

export default ShareMeetingHeader;
