import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import {
  CircularProgress,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Archive, ArchiveStatus } from '../../../api/archiving/model';

const ArchiveDownloadButton = ({ url, id }: { id: string; url: string | undefined }) => {
  const { t } = useTranslation();

  return (
    <Link href={url} target="_blank">
      <Tooltip title={t('archiveList.download.tooltip', { id })}>
        <IconButton>
          <FileDownloadOutlinedIcon data-testid="archive-download-button" />
        </IconButton>
      </Tooltip>
    </Link>
  );
};

const ArchiveErrorIcon = () => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('archiveList.error.tooltip')}>
      <WarningOutlinedIcon
        color="warning"
        sx={{
          alignItems: 'center',
          display: 'flex',
          width: '40px',
          height: '40px',
          padding: '8px',
          justifyContent: 'center',
        }}
        data-testid="archive-error-icon"
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
          padding: '8px',
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

  if (archives === 'error') {
    return (
      <>
        <WarningOutlinedIcon color="warning" />
        <h3 className="text-lg text-slate-500">{t('archiveList.error.text')}</h3>
      </>
    );
  }
  if (!archives.length) {
    return <h3 className="text-lg text-slate-500">{t('archiveList.empty')}</h3>;
  }
  return (
    <div className="md:max-h-[480px] md:overflow-y-auto ">
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
    </div>
  );
};

export default ArchiveList;
