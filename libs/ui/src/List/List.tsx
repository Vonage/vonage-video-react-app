import Box from '@mui/material/Box';
import MaterialList from '@mui/material/List';
import classNames from 'classnames';
import { type ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';
import type { ListProps } from './List.types';
import ListErrorState from './ListErrorState/ListErrorState';
import ListEmptyState from './ListEmptyState/ListEmptyState';
import ListItem from './ListItem/ListItem';

const List = ({
  entries,
  className,
  actionLabel,
  emptyMessage,
  errorMessage,
  errorTooltip,
  ...rootProps
}: ListProps): ReactElement => {
  if (entries === 'error') {
    return <ListErrorState errorMessage={errorMessage} />;
  }

  if (!entries.length) {
    return <ListEmptyState emptyMessage={emptyMessage} />;
  }

  return (
    <Box
      className={twMerge(
        classNames('max-h-47.5 w-full overflow-x-hidden overflow-y-auto pr-2', className)
      )}
      {...rootProps}
    >
      <MaterialList className="pt-0">
        {entries.map((entry, entryIndex) => (
          <ListItem
            actionLabel={actionLabel}
            entry={entry}
            entryIndex={entryIndex}
            errorTooltip={errorTooltip}
            key={entry.id}
          />
        ))}
      </MaterialList>
    </Box>
  );
};

export default List;
