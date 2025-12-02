import { useLocation } from 'react-router-dom';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import FlexLayout from '@ui/FlexLayout';
import Banner from '@components/Banner';
import Footer from '@components/Footer/Footer';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import useCustomTheme from '@Context/Theme';
import useArchives from '../../hooks/useArchives';
import ArchiveList from '../../components/GoodBye/ArchiveList';
import GoodByeMessage from '../../components/GoodBye/GoodbyeMessage';
import useRoomName from '../../hooks/useRoomName';
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
  const location = useLocation();
  const roomName = useRoomName({
    useLocationState: true,
  });
  const archives = useArchives({ roomName });
  const header: string = location.state?.header || t('goodbye.default.header');
  const caption: string = location.state?.caption || t('goodbye.default.message');

  return (
    <FlexLayout>
      <FlexLayout.Banner>
        <Banner />
      </FlexLayout.Banner>
      <FlexLayout.Left>
        <GoodByeMessage header={header} message={caption} roomName={roomName} />
      </FlexLayout.Left>
      <FlexLayout.Right>
        <Box
          sx={{
            height: 'auto',
            width: '100%',
            flexShrink: 1,
            py: 4,
            pl: 12,
            textAlign: 'left',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              width: '75%',
              pb: 5,
              color: theme.colors.secondary,
            }}
          >
            {t('archiveList.label')}
          </Typography>
          <ArchiveList archives={archives} />
        </Box>
      </FlexLayout.Right>
      <FlexLayout.Footer>
        <Footer />
      </FlexLayout.Footer>
    </FlexLayout>
  );
};

export default GoodBye;
