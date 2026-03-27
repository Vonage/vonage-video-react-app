import Tooltip from '@mui/material/Tooltip';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import VividIcon from '@ui/VividIcon';

const ArchiveErrorIndicator = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('archiveList.error.tooltip')}>
      <span className="flex">
        <VividIcon
          className="text-vera-warning"
          customSize={-6}
          data-testid="archive-error-icon"
          name="warning-line"
        />
      </span>
    </Tooltip>
  );
};

export default ArchiveErrorIndicator;
