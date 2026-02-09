import { Fragment, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useTheme from '@ui/theme';

import Separator from '@components/Separator';
import VividIcon from '@components/VividIcon';

import { Archive, ArchiveStatus } from '../../../api/archiving/model';
import formatDuration from '@utils/formatDuration';
import formatFileSize from '@utils/formatFileSize';
import classNames from 'classnames';

const ArchiveErrorIcon = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tooltip title={t('archiveList.error.tooltip')}>
      <VividIcon
        name="warning-line"
        customSize={-6}
        data-testid="archive-error-icon"
        sx={{ color: theme.colors.warning }}
      />
    </Tooltip>
  );
};

const ArchivingLoadingIcon = () => {
  const theme = useTheme();

  return (
    <CircularProgress
      size={20}
      data-testid="archive-loading-spinner"
      sx={{ color: theme.colors.primary }}
    />
  );
};

const ArchiveStatusContent = ({ status, url }: { status: ArchiveStatus; url: string | null }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (status === 'available') {
    return (
      <Link href={url ?? undefined} target="_blank" sx={{ textDecoration: 'none' }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton size="small">
            <VividIcon
              name="download-line"
              customSize={-6}
              data-testid="archive-download-button"
              sx={{ color: theme.colors.textPrimary }}
            />
          </IconButton>
          <Typography variant="caption" sx={{ color: theme.colors.textPrimary }}>
            {t('archiveList.download')}
          </Typography>
        </Stack>
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
  const theme = useTheme();

  if (archives === 'error') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VividIcon name="warning-line" customSize={-4} sx={{ color: theme.colors.warning }} />
        <Typography variant="h6" sx={{ color: theme.colors.textTertiary }}>
          {t('archiveList.error.text')}
        </Typography>
      </Box>
    );
  }
  if (!archives.length) {
    return (
      <>
        <Stack
          data-testid="archive-list-empty"
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <VividIcon
            name="video-active-line"
            customSize={-4}
            sx={{ color: theme.colors.secondary }}
          />
          <Typography variant="body1" sx={{ color: theme.colors.textSecondary }}>
            {t('archiveList.empty')}
          </Typography>
        </Stack>
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
                  sx={{ color: theme.colors.secondary }}
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
                      <Typography variant="caption" sx={{ color: theme.colors.textTertiary }}>
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
