import { Fragment, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { Archive, ArchiveStatus } from '../../../api/archiving/model';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Separator from '@components/Separator';
import VividIcon from '@ui/VividIcon';
import formatDuration from '@utils/formatDuration';
import formatFileSize from '@utils/formatFileSize';
import classNames from 'classnames';
import { isString } from '@common/assertions';

const ArchiveErrorIcon = () => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('archiveList.error.tooltip')}>
      <VividIcon
        name="warning-line"
        customSize={-6}
        data-testid="archive-error-icon"
        style={{ color: 'var(--vera-warning)' }}
      />
    </Tooltip>
  );
};

const ArchivingLoadingIcon = () => {
  return (
    <CircularProgress
      size={20}
      data-testid="archive-loading-spinner"
      className="text-vera-primary"
    />
  );
};

const ArchiveStatusContent = ({ status, url }: { status: ArchiveStatus; url: string | null }) => {
  const { t } = useTranslation();

  if (status === 'available') {
    return (
      <Link href={url ?? undefined} target="_blank" sx={{ textDecoration: 'none' }}>
        <div className="flex items-center gap-1">
          <IconButton size="small">
            <VividIcon
              name="download-line"
              customSize={-6}
              data-testid="archive-download-button"
              style={{ color: 'var(--vera-text-primary)' }}
            />
          </IconButton>
          <Typography variant="caption" className="text-vera-text-primary">
            {t('archiveList.download')}
          </Typography>
        </div>
      </Link>
    );
  }

  if (status === 'pending') {
    return <ArchivingLoadingIcon />;
  }

  return <ArchiveErrorIcon />;
};

export type ArchiveListProps = {
  archives: Archive[] | 'error';
};

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

  const isError = isString(archives);
  if (isError) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VividIcon name="warning-line" customSize={-4} style={{ color: 'var(--vera-warning)' }} />
        <Typography variant="h6" className="text-vera-text-tertiary">
          {t('archiveList.error.text')}
        </Typography>
      </Box>
    );
  }
  if (!archives.length) {
    return (
      <>
        <div className="mb-4 flex items-center gap-3" data-testid="archive-list-empty">
          <VividIcon
            name="video-active-line"
            customSize={-4}
            style={{ color: 'var(--vera-secondary)' }}
          />
          <Typography variant="body1" className="text-vera-text-secondary">
            {t('archiveList.empty')}
          </Typography>
        </div>
        <Separator width="100%" />
      </>
    );
  }
  return (
    <Box sx={{ width: '100%', maxHeight: '190px', overflowY: 'auto', overflowX: 'hidden' }}>
      <List sx={{ pt: 0 }}>
        {archives.map((archive, index) => (
          <Fragment key={archive.id}>
            <ListItem
              disableGutters
              sx={{
                px: 0,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
              data-testid={`archive-list-item-${archive.id}`}
            >
              <ListItemIcon sx={{ minWidth: '45px', mt: '4px' }}>
                <VividIcon
                  name="video-active-line"
                  customSize={-4}
                  style={{ color: 'var(--vera-secondary)' }}
                />
              </ListItemIcon>

              <Box sx={{ flex: 1 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      data-testid={`archive-list-item-title-${index}`}
                      className={classNames({
                        pending: archive.status === 'pending',
                      })}
                    >
                      {archive.status === 'pending'
                        ? t('archiveList.loading')
                        : t('archiveList.archive.index', {
                            index: archives.length - index,
                          })}
                    </Typography>
                  }
                  secondary={
                    (archive.status === 'available' || archive.status === 'pending') && (
                      <Typography variant="caption" className="text-vera-text-tertiary">
                        {archive.status === 'pending' ? (
                          t('archiveList.loading.subtitle')
                        ) : (
                          <>
                            {archive.duration && formatDuration(archive.duration)}
                            {archive.size && ` • ${formatFileSize(archive.size)}`}
                            {` • ${t('archiveList.archive.createdAt', {
                              createdAt: archive.createdAtFormatted,
                            })}`}
                          </>
                        )}
                      </Typography>
                    )
                  }
                />
              </Box>

              <Box sx={{ mt: '4px' }}>
                <ArchiveStatusContent url={archive.url} status={archive.status} />
              </Box>
            </ListItem>

            <Separator width="100%" />
          </Fragment>
        ))}
      </List>
    </Box>
  );
};

export default ArchiveList;
