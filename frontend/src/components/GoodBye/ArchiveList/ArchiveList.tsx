import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Link from '@ui/Link';
import Tooltip from '@ui/Tooltip';
import IconButton from '@ui/IconButton';
import List from '@ui/List';
import ListItem from '@ui/ListItem';
import CircularProgress from '@ui/CircularProgress';
import ListItemText from '@ui/ListItemText';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import useMediaQuery from '@ui/useMediaQuery';
import useCustomTheme from '@Context/Theme';
import VividIcon from '@components/VividIcon';
import { Archive, ArchiveStatus } from '../../../api/archiving/model';

const ArchiveDownloadButton = ({ url, id }: { id: string; url: string | undefined }) => {
  const { t } = useTranslation();
  const theme = useCustomTheme();

  return (
    <Link href={url} target="_blank">
      <Tooltip title={t('archiveList.download.tooltip', { id })}>
        <IconButton>
          <VividIcon
            name="download-line"
            customSize={-4}
            data-testid="archive-download-button"
            sx={{ color: theme.colors.secondary }}
          />
        </IconButton>
      </Tooltip>
    </Link>
  );
};

const ArchiveErrorIcon = () => {
  const { t } = useTranslation();
  const theme = useCustomTheme();

  return (
    <Tooltip title={t('archiveList.error.tooltip')}>
      <VividIcon
        name="warning-line"
        customSize={-3}
        data-testid="archive-error-icon"
        sx={{
          color: theme.colors.warning,
          alignItems: 'center',
          display: 'flex',
          width: '40px',
          height: '40px',
          padding: 1,
          justifyContent: 'center',
        }}
      />
    </Tooltip>
  );
};

const ArchivingLoadingIcon = () => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('archiveList.loading.tooltip')}>
      <CircularProgress
        data-testid="archive-loading-spinner"
        sx={{
          p: 1,
        }}
      />
    </Tooltip>
  );
};

const ArchiveStatusIcon = ({
  status,
  url,
  id,
}: {
  id: string;
  status: ArchiveStatus;
  url: string | null;
}) => {
  if (status === 'available') {
    return <ArchiveDownloadButton id={id} url={url ?? undefined} />;
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
  const isMdUp = useMediaQuery('(min-width:768px)');
  const theme = useCustomTheme();

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
      <Typography variant="h6" sx={{ color: theme.colors.textTertiary }}>
        {t('archiveList.empty')}
      </Typography>
    );
  }
  return (
    <Box
      sx={{
        maxHeight: isMdUp ? '480px' : 'none',
        overflowY: isMdUp ? 'auto' : 'visible',
      }}
    >
      <List sx={{ overflowX: 'auto' }}>
        {archives.map((archive, index) => {
          return (
            <ListItem
              data-testid={`archive-list-item-${archive.id}`}
              key={archive.id}
              secondaryAction={
                <ArchiveStatusIcon id={archive.id} url={archive.url} status={archive.status} />
              }
            >
              <ListItemText
                primary={t('archiveList.archive.index', { index: archives.length - index })}
                secondary={t('archiveList.archive.createdAt', {
                  createdAt: archive.createdAtFormatted,
                })}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default ArchiveList;
