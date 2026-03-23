import Box from '@mui/material/Box';
import List from '@mui/material/List';
import type { ReactElement } from 'react';

import ArchiveListEmptyState from './ArchiveListEmptyState';
import ArchiveListErrorState from './ArchiveListErrorState';
import ArchiveListItem from './ArchiveListItem';
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
  if (archives === 'error') {
    return <ArchiveListErrorState />;
  }

  if (!archives.length) {
    return <ArchiveListEmptyState />;
  }

  return (
    <Box className="max-h-[190px] w-full overflow-x-hidden overflow-y-auto">
      <List className="pt-0">
        {archives.map((archive, index) => (
          <ArchiveListItem
            archive={archive}
            archiveCount={archives.length}
            archiveIndex={index}
            key={archive.id}
          />
        ))}
      </List>
    </Box>
  );
};

export default ArchiveList;
