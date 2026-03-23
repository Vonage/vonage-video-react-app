import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Separator from '@ui/Separator';
import VividIcon from '@ui/VividIcon';

const ArchiveListEmptyState = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <Stack
        alignItems="center"
        className="mb-2 flex-row gap-1.5"
        data-testid="archive-list-empty"
        direction="row"
      >
        <VividIcon className="text-vera-secondary" customSize={-4} name="video-active-line" />
        <Typography className="text-vera-text-secondary" variant="body1">
          {t('archiveList.empty')}
        </Typography>
      </Stack>

      <Separator width="100%" />
    </>
  );
};

export default ArchiveListEmptyState;
