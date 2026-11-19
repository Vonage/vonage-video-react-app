import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Card from '@ui/components/Card';
import CreateOrJoinCard from '../components/CreateOrJoinCard';
import LandingShell from '../components/LandingShell';
import UpcomingMeetingRow from '../components/UpcomingMeetingRow';
import { useArchivedMeetings, useUpcomingMeetings } from '../../stores/meetingsStore';

/**
 * Landing variant A: today's card is kept as it is, and a second card below it lists upcoming meetings.
 */
const LandingStackedCards = (): ReactElement => {
  const { t } = useTranslation();
  const upcomingMeetings = useUpcomingMeetings();
  const archivedCount = useArchivedMeetings().length;

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
            {upcomingMeetings.map((meeting) => (
              <UpcomingMeetingRow key={meeting.id} meeting={meeting} />
            ))}
          </ul>
        </Card>
      </div>
    </LandingShell>
  );
};

export default LandingStackedCards;
