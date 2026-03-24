import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import VividIcon from '@ui/VividIcon';

import type { ArchiveStatusContentProps } from '../ArchiveList.types';

const ArchiveStatusContent = ({ status, url }: ArchiveStatusContentProps): ReactElement => {
  const { t } = useTranslation();

  if (status === 'available') {
    return (
      <Link
        className="no-underline hover:no-underline"
        href={url ?? undefined}
        rel="noreferrer"
        target="_blank"
        underline="none"
      >
        <Stack alignItems="center" className="flex-row gap-0.5" direction="row">
          <span
            className="inline-flex min-h-8 min-w-8 items-center justify-center"
            data-testid="archive-download-button"
          >
            <VividIcon className="text-vera-text-primary" customSize={-6} name="download-line" />
          </span>

          <span className="text-vera-text-primary text-vera-caption">
            {t('archiveList.download')}
          </span>
        </Stack>
      </Link>
    );
  }

  if (status === 'pending') {
    return (
      <CircularProgress
        className="text-vera-primary"
        data-testid="archive-loading-spinner"
        size={20}
      />
    );
  }

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

export default ArchiveStatusContent;
