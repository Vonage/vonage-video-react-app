import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Fragment, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Separator from '@ui/Separator';
import VividIcon from '@ui/VividIcon';

import formatDuration from '@utils/formatDuration';
import formatFileSize from '@utils/formatFileSize';

import {
  ArchiveDownloadLink,
  ArchiveErrorIndicator,
  ArchiveLoadingIndicator,
} from '../ArchiveStatusContent';
import type { ArchiveListItemProps } from '../ArchiveList.types';

const ArchiveListItem = ({
  archive,
  archiveIndex,
  archiveCount,
}: ArchiveListItemProps): ReactElement => {
  const { t } = useTranslation();

  const isArchiveAvailable = archive.status === 'available';
  const isArchivePending = archive.status === 'pending';
  const shouldRenderSubtitle = isArchiveAvailable || isArchivePending;
  const archiveDisplayIndex = getArchiveDisplayIndex({
    archiveCount,
    archiveIndex,
  });
  const archiveTitle = isArchivePending
    ? t('archiveList.loading')
    : t('archiveList.archive.index', {
        index: archiveDisplayIndex,
      });
  const archiveTitleClassName = [
    'text-vera-text-secondary text-vera-body-extended',
    isArchivePending ? 'pending' : null,
  ]
    .filter(Boolean)
    .join(' ');
  const archiveDetails = [
    archive.duration ? formatDuration(archive.duration) : null,
    archive.size ? formatFileSize(archive.size) : null,
    t('archiveList.archive.createdAt', {
      createdAt: archive.createdAtFormatted,
    }),
  ]
    .filter(Boolean)
    .join(' • ');
  const archiveStatusElement = (() => {
    if (isArchiveAvailable) {
      return <ArchiveDownloadLink url={archive.url} />;
    }

    if (isArchivePending) {
      return <ArchiveLoadingIndicator />;
    }

    return <ArchiveErrorIndicator />;
  })();

  return (
    <Fragment>
      <ListItem
        className="flex items-start gap-1 px-0 mb-1.5 mt-1.5"
        data-testid={`archive-list-item-${archive.id}`}
        disableGutters
      >
        <ListItemIcon className="mt-1 min-w-8">
          <VividIcon className="text-vera-secondary" customSize={-4} name="video-active-line" />
        </ListItemIcon>

        <Box className="flex-1">
          <p
            className={archiveTitleClassName}
            data-testid={`archive-list-item-title-${archiveIndex}`}
          >
            {archiveTitle}
          </p>

          {shouldRenderSubtitle && (
            <p className="text-vera-text-tertiary text-vera-caption">
              {isArchivePending ? t('archiveList.loading.subtitle') : archiveDetails}
            </p>
          )}
        </Box>

        <Box className="mt-1">{archiveStatusElement}</Box>
      </ListItem>

      <Separator width="100%" />
    </Fragment>
  );
};

function getArchiveDisplayIndex({
  archiveCount,
  archiveIndex,
}: Pick<ArchiveListItemProps, 'archiveCount' | 'archiveIndex'>): number {
  return archiveCount - archiveIndex;
}

export default ArchiveListItem;
