import Link from '@mui/material/Link';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import VividIcon from '@ui/VividIcon';

type ArchiveDownloadLinkProps = {
  url: string | null;
};

const ArchiveDownloadLink = ({ url }: ArchiveDownloadLinkProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <Link
      className="inline-flex items-center gap-0.5 no-underline hover:no-underline"
      href={url ?? undefined}
      rel="noreferrer"
      target="_blank"
      underline="none"
    >
      <span
        className="inline-flex min-h-8 min-w-8 items-center justify-center"
        data-testid="archive-download-button"
      >
        <VividIcon className="text-vera-text-primary" customSize={-6} name="download-line" />
      </span>

      <span className="text-vera-text-primary text-vera-caption">{t('archiveList.download')}</span>
    </Link>
  );
};

export default ArchiveDownloadLink;
