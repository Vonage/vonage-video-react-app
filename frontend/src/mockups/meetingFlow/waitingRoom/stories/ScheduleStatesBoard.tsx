import type { ComponentType, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import NotificationItem from '@ui/components/NotificationItem';
import type { NotificationId } from '@core/stores/notifications';
import formatCountdown from '../../helpers/formatCountdown';
import getScheduleStatus from '../../helpers/getScheduleStatus';
import mockupNow from '../../sampleData/mockupNow';
import meetingSchedule$ from '../context/meetingScheduleContext';
import sampleScheduleStates, { type SampleScheduleState } from './sampleScheduleStates';

const STARTED_TOAST_ID = 'notification:meeting-started' as NotificationId;

/**
 * Every waiting-room state of one card variant side by side, each labelled with the tab title it would set.
 */
const ScheduleStatesBoard = ({ card: CardVariant }: { card: ComponentType }): ReactElement => {
  const { t } = useTranslation();

  const getTabTitle = ({ meetingName, schedule }: SampleScheduleState) => {
    const status = getScheduleStatus({ schedule, now: mockupNow });
    if (status.kind === 'started') {
      return t('meetingFlow.waitingRoom.tabTitle.started', { name: meetingName });
    }
    if (status.kind === 'withinFiveMinutes') {
      return t('meetingFlow.waitingRoom.tabTitle.countdown', {
        countdown: formatCountdown(status.secondsLeft),
        name: meetingName,
      });
    }
    return meetingName;
  };

  return (
    <div className="flex flex-wrap justify-center gap-6 p-6">
      {sampleScheduleStates.map((sample) => (
        <section key={sample.key} className="flex w-full max-w-110 flex-col gap-2">
          <div className="flex flex-col">
            <h3 className="font-vera-plain text-vera-body-base-semibold text-vera-text-primary">
              {t(`meetingFlow.waitingRoom.state.${sample.key}`)}
            </h3>
            <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
              {t('meetingFlow.waitingRoom.tabTitle', { title: getTabTitle(sample) })}
            </span>
          </div>
          {sample.key === 'started' && (
            <NotificationItem
              id={STARTED_TOAST_ID}
              type="success"
              message={t('meetingFlow.waitingRoom.startedToast')}
              expirationMs={null}
              onDismiss={() => {}}
              className="w-full"
            />
          )}
          <meetingSchedule$.Provider
            value={(state) => ({
              ...state,
              meetingName: sample.meetingName,
              schedule: sample.schedule,
              username: sample.username,
              isAutoJoinEnabled: sample.isAutoJoinEnabled,
            })}
          >
            <CardVariant />
          </meetingSchedule$.Provider>
        </section>
      ))}
    </div>
  );
};

export default ScheduleStatesBoard;
