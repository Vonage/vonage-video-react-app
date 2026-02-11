import { useLocation } from 'react-router-dom';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@ui/PageLayout';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import Typography from '@mui/material/Typography';
import useArchives from '../../hooks/useArchives';
import ArchiveList from '../../components/GoodBye/ArchiveList';
import GoodByeMessage from '../../components/GoodBye/GoodbyeMessage';
import useRoomName from '../../hooks/useRoomName';
import ReenterRoomButton from '@components/GoodBye/ReenterRoomButton';
import GoToLandingPageButton from '@components/GoodBye/GoToLandingPageButton';
import Card from '@ui/Card';
import Stack from '@mui/material/Stack';
import useTheme from '@ui/theme';

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
  const theme = useTheme();
  const location = useLocation();
  const roomName = useRoomName({
    useLocationState: true,
  });
  const archives = useArchives({ roomName });
  const header: string = location.state?.header || t('goodbye.default.header');
  const caption: string = location.state?.caption || t('goodbye.default.message');

  return (
    <PageLayout>
      <PageLayout.Banner>
        <Banner />
      </PageLayout.Banner>
      <PageLayout.Left>
        <GoodByeMessage header={header} message={caption} />
      </PageLayout.Left>
      <PageLayout.Right>
        <Stack direction="column" gap={4}>
          <Card
            className="lg:max-w-[500px]"
            sx={{
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: theme.colors.textSecondary,
                mb: 3,
                width: '100%',
                textAlign: 'left',
              }}
            >
              {t('goodBye.title')}
            </Typography>
            <ReenterRoomButton roomName={roomName} />
            <GoToLandingPageButton />
          </Card>

          <Card className="min-w-full lg:min-w-[500px] lg:max-w-[500px]">
            <Typography
              variant="h6"
              sx={{
                color: theme.colors.textSecondary,
                mb: 3,
              }}
            >
              {t('archiveList.label')}
            </Typography>
            <ArchiveList archives={archives} />
          </Card>
        </Stack>
      </PageLayout.Right>
      <PageLayout.Footer>
        <Footer />
      </PageLayout.Footer>
    </PageLayout>
  );
};

export default GoodBye;
