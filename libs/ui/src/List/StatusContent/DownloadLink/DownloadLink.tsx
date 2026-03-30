import Link from '@mui/material/Link';
import type { ReactElement } from 'react';

import VividIcon from '@ui/VividIcon';

import type { DownloadLinkProps } from '../../List.types';

const DownloadLink = ({ actionLabel, url }: DownloadLinkProps): ReactElement => {
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
        data-testid="list-action-button"
      >
        <VividIcon className="text-vera-text-primary" customSize={-6} name="download-line" />
      </span>

      <span className="text-vera-caption text-vera-text-primary">{actionLabel}</span>
    </Link>
  );
};

export default DownloadLink;
