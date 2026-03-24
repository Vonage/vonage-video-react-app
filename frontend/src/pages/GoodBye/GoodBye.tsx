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
import Stack from '@mui/material/Stack';
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
  const { roomName, archives, header, caption, isSelfDeclinedRecording } = useGoodByePage();

  return (
    <PageLayout>
      <PageLayout.Banner>
        <Banner />
      </PageLayout.Banner>
      <PageLayout.Left>
        <GoodByeMessage header={header} message={caption} />
      </PageLayout.Left>
      <PageLayout.Right>
        <Stack direction="column" gap={4} className="w-full items-center">
          <Card className="w-full max-w-125">
            <p className="text-xl font-medium font-vera-plain text-vera-secondary mb-3 w-full text-left">
              {t('goodBye.title')}
            </p>
            <div className="mb-6 w-full">
              <ReenterRoomButton roomName={roomName} />
            </div>
            <GoToLandingPageButton />
          </Card>
          {!isSelfDeclinedRecording && (
            <Card className="w-full max-w-125">
              <p className="text-xl font-medium font-vera-plain text-vera-secondary mb-6">
                {t('archiveList.label')}
              </p>
              <ArchiveList archives={archives} />
            </Card>
          )}
        </Stack>
      </PageLayout.Right>
      <PageLayout.Footer>
        <Footer />
      </PageLayout.Footer>
    </PageLayout>
  );
};

export default GoodBye;
