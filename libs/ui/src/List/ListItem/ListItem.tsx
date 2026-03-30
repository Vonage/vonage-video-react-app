import Box from '@mui/material/Box';
import MaterialListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Fragment, type ReactElement } from 'react';

import Separator from '@ui/Separator';
import VividIcon from '@ui/VividIcon';

import { DownloadLink, ErrorIndicator, LoadingIndicator } from '../StatusContent';
import type { ListItemProps } from '../List.types';

const ListItem = ({
  actionLabel,
  entry,
  entryIndex,
  errorTooltip,
}: ListItemProps): ReactElement => {
  const isEntryAvailable = entry.status === 'available';
  const isEntryPending = entry.status === 'pending';
  const shouldRenderSubtitle = Boolean(entry.subtitle);
  const entryTitleClassName = [
    'text-vera-text-secondary text-vera-body-extended',
    isEntryPending ? 'pending' : null,
  ]
    .filter(Boolean)
    .join(' ');
  const statusElement = (() => {
    if (isEntryAvailable) {
      return <DownloadLink actionLabel={actionLabel} url={entry.downloadUrl} />;
    }

    if (isEntryPending) {
      return <LoadingIndicator />;
    }

    return <ErrorIndicator errorTooltip={errorTooltip} />;
  })();

  return (
    <Fragment>
      <MaterialListItem
        className="mb-1.5 mt-1.5 flex items-start gap-1 px-0"
        data-testid={`list-item-${entry.id}`}
        disableGutters
      >
        <ListItemIcon className="mt-1 min-w-8">
          <VividIcon className="text-vera-secondary" customSize={-4} name="video-active-line" />
        </ListItemIcon>

        <Box className="flex-1">
          <p className={entryTitleClassName} data-testid={`list-item-title-${entryIndex}`}>
            {entry.title}
          </p>

          {shouldRenderSubtitle && (
            <p className="text-vera-caption text-vera-text-tertiary">{entry.subtitle}</p>
          )}
        </Box>

        <Box className="mt-1">{statusElement}</Box>
      </MaterialListItem>

      <Separator width="100%" />
    </Fragment>
  );
};

export default ListItem;
