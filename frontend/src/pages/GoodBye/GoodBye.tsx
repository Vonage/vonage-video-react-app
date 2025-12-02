import { useLocation, useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import FlexLayout from '@ui/FlexLayout';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import Typography from '@ui/Typography';
import useCustomTheme from '@Context/Theme';
import useArchives from '../../hooks/useArchives';
import ArchiveList from '../../components/GoodBye/ArchiveList';
import GoodByeMessage from '../../components/GoodBye/GoodbyeMessage';
import useRoomName from '../../hooks/useRoomName';
import ReenterRoomButton from '@components/GoodBye/ReenterRoomButton';
import GoToLandingPageButton from '@components/GoodBye/GoToLandingPageButton';
import Card from '@ui/Card';
import Stack from '@ui/Stack';
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
  const theme = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const roomName = useRoomName({
    useLocationState: true,
  });
  const archives = useArchives({ roomName });
  const header: string = location.state?.header || t('goodbye.default.header');
  const caption: string = location.state?.caption || t('goodbye.default.message');

  const handleLanding = () => {
    navigate('/');
  };

  const handleReenter = () => {
    navigate(`/waiting-room/${roomName}`);
  };

  return (
    <FlexLayout>
      <FlexLayout.Banner>
        <Banner />
      </FlexLayout.Banner>
      <FlexLayout.Left>
        <GoodByeMessage header={header} message={caption} />
      </FlexLayout.Left>
      <FlexLayout.Right>
        <Stack direction="column" gap={4}>
          <Card
            sx={{
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: theme.colors.textSecondary,
                mb: 3,
                textAlign: 'left',
              }}
            >
              {t('goodBye.title')}
            </Typography>
            <ReenterRoomButton handleReenter={handleReenter} roomName={roomName} />
            <GoToLandingPageButton handleLanding={handleLanding} />
          </Card>

          <Card>
            <Typography
              variant="h6"
              sx={{
                color: theme.colors.textSecondary,
              }}
            >
              {t('archiveList.label')}
            </Typography>
            <ArchiveList archives={archives} />
          </Card>
        </Stack>
      </FlexLayout.Right>
      <FlexLayout.Footer>
        <Footer />
      </FlexLayout.Footer>
    </FlexLayout>
  );
};

export default GoodBye;
