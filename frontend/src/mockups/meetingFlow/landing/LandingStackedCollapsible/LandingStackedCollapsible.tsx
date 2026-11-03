import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Card from '@ui/components/Card';
import CollapsibleMeetingRow from '../components/CollapsibleMeetingRow';
import CreateOrJoinCard from '../components/CreateOrJoinCard';
import LandingShell from '../components/LandingShell';
import groupMeetingsByDay from '../../helpers/groupMeetingsByDay';
import mockupNow from '../../sampleData/mockupNow';
import { useArchivedMeetings, useUpcomingMeetings } from '../../stores/meetingsStore';

/**
 * Landing variant D: variant A's two cards, with the upcoming list turned into borderless collapsible rows and the soonest one open.
 */
const LandingStackedCollapsible = (): ReactElement => {
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
      <div className="flex w-full flex-col gap-6 py-6 lg:max-w-125">
        <CreateOrJoinCard />
        <Card className="gap-2">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex flex-col">
              <h6 className="font-vera-plain text-vera-heading-4 text-vera-text-secondary">
                {t('meetingFlow.landing.upcoming.title')}
              </h6>
              <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
                {t('meetingFlow.landing.upcoming.subtitle')}
              </span>
            </div>
            <Button variant="text" size="small">
              {t('meetingFlow.landing.upcoming.archived', { count: archivedCount })}
            </Button>
          </div>
          <ul className="flex w-full flex-col">
            <CollapsibleMeetingRow meeting={nextMeeting} nextUp={{ minutesUntilStart }} />
            {laterMeetings.map((meeting) => (
              <CollapsibleMeetingRow key={meeting.id} meeting={meeting} nextUp={null} />
            ))}
          </ul>
        </Card>
      </div>
    </LandingShell>
  );
};

export default LandingStackedCollapsible;
