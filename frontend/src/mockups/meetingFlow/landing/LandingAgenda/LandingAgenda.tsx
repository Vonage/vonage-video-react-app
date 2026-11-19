import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { PageLayout } from '@ui';
import Card from '@ui/components/Card';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import LandingPageWelcome from '@components/LandingPageWelcome';
import AgendaRow from '../components/AgendaRow';
import InlineCreateJoinBar from '../components/InlineCreateJoinBar';
import groupMeetingsByDay from '../../helpers/groupMeetingsByDay';
import mockupNow from '../../sampleData/mockupNow';
import { useArchivedMeetings, useUpcomingMeetings } from '../../stores/meetingsStore';

/**
 * Landing variant B: create and join move under the welcome text, the right column becomes an agenda.
 */
const LandingAgenda = (): ReactElement => {
  const { t } = useTranslation();
  const upcomingMeetings = useUpcomingMeetings();
  const archivedCount = useArchivedMeetings().length;
  const groups = groupMeetingsByDay({ meetings: upcomingMeetings, now: mockupNow });

  return (
    <PageLayout>
      <PageLayout.Banner>
        <Banner />
      </PageLayout.Banner>
      <PageLayout.Left>
        <div className="flex w-full max-w-180 flex-col gap-10 max-sm:px-6">
          <LandingPageWelcome />
          <InlineCreateJoinBar />
        </div>
      </PageLayout.Left>
      <PageLayout.Right>
        <Card className="w-full gap-6 py-6 lg:max-w-125">
          <div className="flex w-full items-center justify-between gap-4">
            <h6 className="font-vera-plain text-vera-heading-4 text-vera-text-secondary">
              {t('meetingFlow.landing.agenda.title')}
            </h6>
            <Button variant="text" size="small">
              {t('meetingFlow.landing.upcoming.archived', { count: archivedCount })}
            </Button>
          </div>
          {groups.map(({ key, meetings }) => (
            <section key={key} className="flex w-full flex-col gap-2">
              <h3 className="font-vera-plain text-vera-caption-semibold uppercase text-vera-text-tertiary">
                {t(`meetingFlow.landing.upcoming.${key}`)}
              </h3>
              <ul className="flex flex-col gap-2">
                {meetings.map((meeting) => (
                  <AgendaRow key={meeting.id} meeting={meeting} now={mockupNow} />
                ))}
              </ul>
            </section>
          ))}
          <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
            {t('meetingFlow.landing.upcoming.subtitle')}
          </span>
        </Card>
      </PageLayout.Right>
      <PageLayout.Footer>
        <Footer />
      </PageLayout.Footer>
    </PageLayout>
  );
};

export default LandingAgenda;
