import ListUi, { type ListEntry } from '@ui/List';
import type { ReactElement } from 'react';

import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { Archive } from '../../../api/archiving/model';
import formatDuration from '@utils/formatDuration';
import formatFileSize from '@utils/formatFileSize';
import type { ArchiveListProps } from './ArchiveList.types';

/**
 * ArchiveList
 *
 * This component displays any archives.
 * @param {ArchiveListProps} props - The props for the component.
 *  @property {Archive[] | 'error'} archives - Array of archives, or 'error'.
 * @returns {ReactElement} - The ArchiveList component.
 */
const ArchiveList = ({ archives }: ArchiveListProps): ReactElement => {
  const { t } = useTranslation();

  const archiveListEntries: ListEntry[] | 'error' = (() => {
    if (archives === 'error') {
      return 'error';
    }

    return archives.map((archive, archiveIndex) => {
      return createArchiveListEntry({
        archive,
        archiveCount: archives.length,
        archiveIndex,
        t,
      });
    });
  })();

  return (
    <ListUi
      actionLabel={t('archiveList.download')}
      emptyMessage={t('archiveList.empty')}
      entries={archiveListEntries}
      errorMessage={t('archiveList.error.text')}
      errorTooltip={t('archiveList.error.tooltip')}
    />
  );
};

function createArchiveListEntry({
  archive,
  archiveCount,
  archiveIndex,
  t,
}: {
  archive: Archive;
  archiveCount: number;
  archiveIndex: number;
  t: TFunction;
}): ListEntry {
  const isArchiveAvailable = archive.status === 'available';
  const isArchivePending = archive.status === 'pending';
  const archiveDisplayIndex = archiveCount - archiveIndex;
  const archiveTitle = t('archiveList.archive.index', {
    index: archiveDisplayIndex,
  });

  if (isArchiveAvailable) {
    return {
      downloadUrl: archive.url,
      id: archive.id,
      status: 'available',
      subtitle: getArchiveDetails({ archive, t }),
      title: archiveTitle,
    };
  }

  if (isArchivePending) {
    return {
      id: archive.id,
      status: 'pending',
      subtitle: t('archiveList.loading.subtitle'),
      title: t('archiveList.loading'),
    };
  }

  return {
    id: archive.id,
    status: 'failed',
    subtitle: null,
    title: archiveTitle,
  };
}

function getArchiveDetails({ archive, t }: { archive: Archive; t: TFunction }): string {
  return [
    archive.duration ? formatDuration(archive.duration) : null,
    archive.size ? formatFileSize(archive.size) : null,
    t('archiveList.archive.createdAt', {
      createdAt: archive.createdAtFormatted,
    }),
  ]
    .filter(Boolean)
    .join(' • ');
}

export default ArchiveList;
