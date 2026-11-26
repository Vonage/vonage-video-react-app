import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Separator from '@components/Separator';
import CompactMeetingRow from '../components/CompactMeetingRow';
import CreateOrJoinCard from '../components/CreateOrJoinCard';
import LandingShell from '../components/LandingShell';
import NextUpSpotlight from '../components/NextUpSpotlight';
import groupMeetingsByDay from '../../helpers/groupMeetingsByDay';
import mockupNow from '../../sampleData/mockupNow';
import { useArchivedMeetings, useUpcomingMeetings } from '../../stores/meetingsStore';

const LATER_PREVIEW_COUNT = 3;

/**
 * Landing variant C: one card, with the soonest meeting spotlighted under create and join.
 */
const LandingNextUp = (): ReactElement => {
  const { t } = useTranslation();
  const upcomingMeetings = useUpcomingMeetings();
  const archivedCount = useArchivedMeetings().length;
  const [nextMeeting, ...laterMeetings] = groupMeetingsByDay({
    meetings: upcomingMeetings,
    now: mockupNow,
  }).flatMap(({ meetings }) => meetings);
  const minutesUntilStart = Math.round(
    ((nextMeeting.schedule?.startsAt.getTime() ?? mockupNow.getTime()) - mockupNow.getTime()) /
      60_000
  );

  return (
    <LandingShell>
      <CreateOrJoinCard className="w-full py-6 lg:max-w-125">
        <div className="flex w-full flex-col gap-4 pt-8">
          <Separator width="100%" />
          <NextUpSpotlight meeting={nextMeeting} minutesUntilStart={minutesUntilStart} />
          <ul className="flex w-full flex-col">
            {laterMeetings.slice(0, LATER_PREVIEW_COUNT).map((meeting) => (
              <CompactMeetingRow key={meeting.id} meeting={meeting} />
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <Button variant="text" size="small">
              {t('meetingFlow.landing.upcoming.viewAll', { count: upcomingMeetings.length })}
            </Button>
            <Button variant="text" size="small" color="secondary">
              {t('meetingFlow.landing.upcoming.archived', { count: archivedCount })}
            </Button>
          </div>
        </div>
      </CreateOrJoinCard>
    </LandingShell>
  );
};

export default LandingNextUp;
