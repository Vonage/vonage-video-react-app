import ArchiveList from '@components/GoodBye/ArchiveList';
import GoodByeMessage from '@components/GoodBye/GoodbyeMessage';
import ReenterRoomButton from '@components/GoodBye/ReenterRoomButton';
import useGoodByePage from '@hooks/useGoodByePage';
import { Stack } from '@mui/material';
import { Card, PageLayoutEmbed } from '@ui';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { Archive } from '../../../api/archiving/model';

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
  const { roomName, archives, archivesError, header, caption } = useGoodByePage();

  const archiveListValue: Archive[] | 'error' = archivesError ? 'error' : (archives ?? []);

  return (
    <PageLayoutEmbed>
      <PageLayoutEmbed.Left>
        <GoodByeMessage header={header} message={caption} />
      </PageLayoutEmbed.Left>
      <PageLayoutEmbed.Right>
        <Stack direction="column" gap={4}>
          <Card className="lg:min-w-125 items-center">
            <p className="text-xl font-medium font-vera-plain text-vera-secondary mb-3 w-full text-left">
              {t('goodBye.title')}
            </p>
            <ReenterRoomButton roomName={roomName} />
          </Card>

          <Card className="min-w-full lg:min-w-125">
            <p className="text-xl font-medium font-vera-plain text-vera-secondary mb-6">
              {t('archiveList.label')}
            </p>
            <ArchiveList archives={archiveListValue} />
          </Card>
        </Stack>
      </PageLayoutEmbed.Right>
    </PageLayoutEmbed>
  );
};

export default GoodByeStage;
