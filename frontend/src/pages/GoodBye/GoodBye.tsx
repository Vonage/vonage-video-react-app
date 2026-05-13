import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@ui/PageLayout';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import ArchiveList from '../../components/GoodBye/ArchiveList';
import GoodByeMessage from '../../components/GoodBye/GoodbyeMessage';
import ReenterRoomButton from '@components/GoodBye/ReenterRoomButton';
import GoToLandingPageButton from '@components/GoodBye/GoToLandingPageButton';
import Card from '@ui/Card';
import useGoodByePage from '../../hooks/useGoodByePage';

/**
 * GoodBye Component
 *
 * This component displays a goodbye message when a user leaves the meeting room.
 * It shows a banner, a set of salutations, and two buttons:
 * - One to re-enter the room
 * - One to go back to the landing page
 * It also shows a list of archives available for download (if applicable).
 * @returns {ReactElement} - the goodbye page.
 */
const GoodBye = (): ReactElement => {
  const { t } = useTranslation();
  const { archives, header, caption, isSelfDeclinedRecording } = useGoodByePage();

  return (
    <PageLayout>
      <PageLayout.Banner>
        <Banner />
      </PageLayout.Banner>
      <PageLayout.Left>
        <GoodByeMessage header={header} message={caption} />
      </PageLayout.Left>
      <PageLayout.Right>
        <div className="flex w-full flex-col items-center gap-8">
          <Card className="w-full max-w-125">
            <p className="font-vera-plain text-vera-heading-4 text-vera-secondary mb-3 w-full text-left">
              {t('goodBye.title')}
            </p>
            <div className="mb-6 w-full">
              <ReenterRoomButton />
            </div>
            <GoToLandingPageButton />
          </Card>
          {!isSelfDeclinedRecording && (
            <Card className="w-full max-w-125">
              <p className="font-vera-plain text-vera-heading-4 text-vera-secondary mb-6">
                {t('archiveList.label')}
              </p>
              <ArchiveList archives={archives} />
            </Card>
          )}
        </div>
      </PageLayout.Right>
      <PageLayout.Footer>
        <Footer />
      </PageLayout.Footer>
    </PageLayout>
  );
};

export default GoodBye;
