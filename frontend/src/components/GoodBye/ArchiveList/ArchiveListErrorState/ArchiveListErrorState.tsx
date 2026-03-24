import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import VividIcon from '@ui/VividIcon';

const ArchiveListErrorState = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      <VividIcon className="text-vera-warning" customSize={-4} name="warning-line" />
      <p className="text-vera-text-tertiary text-vera-heading-4 ml-1">
        {t('archiveList.error.text')}
      </p>
    </div>
  );
};

export default ArchiveListErrorState;
