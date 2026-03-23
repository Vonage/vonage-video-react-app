import type { Archive, ArchiveStatus } from '../../../api/archiving/model';

export type ArchiveListProps = {
  archives: Archive[] | 'error';
};

export type ArchiveListItemProps = {
  archive: Archive;
  archiveIndex: number;
  archiveCount: number;
};

export type ArchiveStatusContentProps = {
  status: ArchiveStatus;
  url: string | null;
};
