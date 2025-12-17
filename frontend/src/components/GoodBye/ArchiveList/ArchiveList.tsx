import { Fragment, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Link from '@ui/Link';
import Tooltip from '@ui/Tooltip';
import ListItem from '@ui/ListItem';
import ListItemIcon from '@ui/ListItemIcon';
import CircularProgress from '@ui/CircularProgress';
import ListItemText from '@ui/ListItemText';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import VividIcon from '@components/VividIcon';
import { Archive, ArchiveStatus } from '../../../api/archiving/model';
import IconButton from '@ui/IconButton';
import List from '@ui/List';
import formatDuration from '@utils/formatDuration';
import formatFileSize from '@utils/formatFileSize';
import Stack from '@ui/Stack';
import Separator from '@components/Separator';
import useTheme from '@ui/theme';

const ArchiveErrorIcon = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tooltip title={t('archiveList.error.tooltip')}>
      <VividIcon
        name="warning-line"
        customSize={-6}
        data-testid="archive-error-icon"
        sx={{
          color: theme.colors.warning,
        }}
      />
    </Tooltip>
  );
};

const ArchivingLoadingIcon = () => {
  const theme = useTheme();

  return (
    <CircularProgress
      data-testid="archive-loading-spinner"
      sx={{
        p: 1,
        color: theme.colors.primary,
      }}
    />
  );
};

const ArchiveStatusContent = ({ status, url }: { status: ArchiveStatus; url: string | null }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (status === 'available') {
    return (
      <Link href={url ?? undefined} target="_blank" sx={{ textDecoration: 'none' }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ mb: { xs: 2, sm: 2, md: 5, lg: 2 } }}
        >
          <IconButton>
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
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
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
    <Box
      sx={{
        width: '100%',
        maxHeight: '190px',
      }}
    >
      <List sx={{ pt: 0 }}>
        {archives.map((archive, index) => {
          return (
            <Fragment key={archive.id}>
              <ListItem
                data-testid={`archive-list-item-${archive.id}`}
                sx={{
                  px: 0,
                }}
                secondaryAction={<ArchiveStatusContent url={archive.url} status={archive.status} />}
              >
                <ListItemIcon sx={{ minWidth: '45px' }}>
                  <VividIcon
                    name="video-active-line"
                    customSize={-4}
                    sx={{ color: theme.colors.secondary }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      {archive.status === 'pending'
                        ? t('archiveList.loading')
                        : t('archiveList.archive.index', { index: archives.length - index })}
                    </Typography>
                  }
                  secondary={
                    (archive.status === 'available' || archive.status === 'pending') && (
                      <Typography variant="caption" sx={{ color: theme.colors.textTertiary }}>
                        {archive.status === 'pending' ? (
                          t('archiveList.loading.subtitle')
                        ) : (
                          <>
                            {archive.duration && `${formatDuration(archive.duration)}`}
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
              </ListItem>

              <Separator width="100%" />
            </Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default ArchiveList;
