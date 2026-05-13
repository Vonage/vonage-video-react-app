import ArchiveList from '@components/GoodBye/ArchiveList';
import GoodByeMessage from '@components/GoodBye/GoodbyeMessage';
import ReenterRoomButton from '@components/GoodBye/ReenterRoomButton';
import useGoodByePage from '@hooks/useGoodByePage';
import { Card, PageLayoutEmbed } from '@ui';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { archives, header, caption } = useGoodByePage();

  return (
    <PageLayoutEmbed>
      <PageLayoutEmbed.Left>
        <GoodByeMessage header={header} message={caption} />
      </PageLayoutEmbed.Left>
      <PageLayoutEmbed.Right>
        <div className="flex flex-col gap-8">
          <Card className="lg:min-w-125 items-center">
            <p className="font-vera-plain text-vera-heading-4 text-vera-secondary mb-3 w-full text-left">
              {t('goodBye.title')}
            </p>
            <ReenterRoomButton />
          </Card>

          <Card className="min-w-full lg:min-w-125">
            <p className="font-vera-plain text-vera-heading-4 text-vera-secondary mb-6">
              {t('archiveList.label')}
            </p>
            <ArchiveList archives={archives} />
          </Card>
        </div>
      </PageLayoutEmbed.Right>
    </PageLayoutEmbed>
  );
};

export default GoodByeStage;
