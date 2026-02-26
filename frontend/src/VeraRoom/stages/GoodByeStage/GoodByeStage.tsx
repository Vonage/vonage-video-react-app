import type { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@ui/Card';
import GoodByeMessage from '@components/GoodBye/GoodbyeMessage';
import ArchiveList from '@components/GoodBye/ArchiveList';
import ReenterRoomButton from '@components/GoodBye/ReenterRoomButton';
import useArchives from '@hooks/useArchives';
import useRoomName from '@hooks/useRoomName';
import useTheme from '@ui/theme';

/**
 * GoodByeStage
 *
 * Embeddable version of the goodbye screen. Equivalent to GoodBye but without
 * the Vera chrome (Banner, Footer) and without the GoToLandingPageButton since
 * there is no landing page in the embed context.
 *
 * Re-enter the room button navigates back to /waiting-room/:roomName via
 * the parent MemoryRouter in VeraRoom.
 */
const GoodByeStage: FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const location = useLocation();
  const roomName = useRoomName({ useLocationState: true });
  const archives = useArchives({ roomName });

  const header: string = location.state?.header || t('goodbye.default.header');
  const caption: string = location.state?.caption || t('goodbye.default.message');

  const hasArchives = archives !== 'error' && archives.length > 0;

  return (
    <div
      data-testid="goodByeStage"
      className="flex flex-col md:flex-row gap-6 p-6 h-full w-full overflow-auto"
    >
      <div className="flex-1 flex items-center justify-center">
        <GoodByeMessage header={header} message={caption} />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Stack direction="column" gap={4} className="w-full lg:max-w-125">
          <Card sx={{ alignItems: 'center' }}>
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
          </Card>

          {hasArchives && (
            <Card>
              <Typography variant="h6" sx={{ color: theme.colors.textSecondary, mb: 3 }}>
                {t('archiveList.label')}
              </Typography>
              <ArchiveList archives={archives} />
            </Card>
          )}
        </Stack>
      </div>
    </div>
  );
};

export default GoodByeStage;
