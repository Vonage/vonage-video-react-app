import type { Archive } from '../../../api/archiving/model';

export type ArchiveListProps = {
  archives: Archive[] | 'error';
};
