import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import VividIcon from '@ui/VividIcon';

const ArchiveListErrorState = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      <VividIcon className="text-vera-warning" customSize={-4} name="warning-line" />
      <Typography className="text-vera-text-tertiary" variant="h6">
        {t('archiveList.error.text')}
      </Typography>
    </div>
  );
};

export default ArchiveListErrorState;
