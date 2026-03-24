import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Separator from '@ui/Separator';
import VividIcon from '@ui/VividIcon';

const ArchiveListEmptyState = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-4 flex flex-row items-center gap-1.5" data-testid="archive-list-empty">
        <VividIcon className="text-vera-secondary" customSize={-4} name="video-active-line" />
        <p className="text-vera-text-secondary text-vera-body-extended ml-2">
          {t('archiveList.empty')}
        </p>
      </div>

      <Separator width="100%" />
    </>
  );
};

export default ArchiveListEmptyState;
