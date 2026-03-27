import type { Archive } from '../../../api/archiving/model';

export type ArchiveListProps = {
  archives: Archive[] | 'error';
};

export type ArchiveListItemProps = {
  archive: Archive;
  archiveIndex: number;
  archiveCount: number;
};
