import { type ComponentProps, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getFormattedDate, getFormattedTime } from '../../../utils/dateTime';
import { Tooltip, CircularProgress } from '@mui/material';
import { VividIcon } from '@ui/components';
import formatDuration from '@utils/formatDuration';
import formatFileSize from '@utils/formatFileSize';
import classNames from 'classnames';
import { useArchives, type UseArchivesProps } from '@core/hooks';
import useSessionKeyParam from '@hooks/useSessionKeyParam';
import { twMerge } from 'tailwind-merge';
import type { SingleArchiveResponse } from '@vonage/video';

export type ArchiveListProps = ComponentProps<'ul'> & {
  queryOptions?: UseArchivesProps['queryOptions'];
};

/**
 * ArchiveList
 *
 * This component displays any archives.
 * @param {ArchiveListProps} props - The props for the component.
 *  @property {Archive[] | 'error'} archives - Array of archives, or 'error'.
 * @returns {ReactElement} - The ArchiveList component.
 */
const ArchiveList = ({ className, queryOptions, ...props }: ArchiveListProps): ReactElement => {
  const { sessionKey } = useSessionKeyParam();

  const { data, error } = useArchives({
    sessionKey,
    queryOptions,
  });

  const {
    t,
    i18n: { language },
  } = useTranslation();

  const archives = useMemo(() => {
    return (data?.items ?? []).map((archive) => ({
      ...archive,
      createdAtFormatted: `${getFormattedDate(language, archive.createdAt)} ${getFormattedTime(language, archive.createdAt)}`,
    }));
  }, [data, language]);

  return (
    <ul className={twMerge('ArchiveList', 'max-h-47.5 overflow-y-auto', className)} {...props}>
      {!!error && (
        <ListElement data-testid="archive-list-error">
          <VividIcon name="warning-line" customSize={-4} className="text-vera-warning" />
          <p className="text-left">{t('archiveList.error.text')}</p>
        </ListElement>
      )}

      {!error && !archives.length && (
        <ListElement data-testid="archive-list-empty">
          <VividIcon name="video-active-line" customSize={-4} className="text-vera-secondary" />
          <p className="text-left">{t('archiveList.empty')}</p>
        </ListElement>
      )}

      {archives.map((archive, index) => {
        const isArchivePending = isPending(archive.status);
        return (
          <ListElement key={archive.id} data-testid={`archive-list-item-${archive.id}`}>
            <VividIcon name="video-active-line" customSize={-4} />

            <div className="flex flex-col">
              <p
                data-testid={`archive-list-item-title-${index}`}
                className={classNames(
                  {
                    pending: isArchivePending,
                  },
                  'text-left'
                )}
              >
                {isArchivePending
                  ? t('archiveList.loading')
                  : t('archiveList.archive.index', {
                      index: archives.length - index,
                    })}
              </p>

              <p className="text-vera-text-tertiary text-vera-caption">
                {isArchivePending && t('archiveList.loading.subtitle')}

                {archive.status === 'available' && (
                  <>
                    {archive.duration && formatDuration(archive.duration)}
                    {archive.size && ` • ${formatFileSize(archive.size)}`}
                    {` • ${t('archiveList.archive.createdAt', {
                      createdAt: archive.createdAtFormatted,
                    })}`}
                  </>
                )}
              </p>
            </div>

            <ArchiveStatus {...archive} />
          </ListElement>
        );
      })}
    </ul>
  );
};

function ListElement({ children, className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      className={twMerge(
        'flex items-center gap-4 py-3 not-last:border-b border-vera-border',
        className
      )}
      {...props}
    >
      {children}
    </li>
  );
}

function ArchiveStatus({ status, url }: SingleArchiveResponse) {
  const { t } = useTranslation();

  if (status === 'available' && url) {
    return (
      <a
        href={url}
        className="flex items-center gap-2 text-vera-text-primary cursor-pointer"
        target="_blank"
        rel="noopener noreferrer"
      >
        <VividIcon
          name="download-line"
          customSize={-6}
          data-testid="archive-download-button"
          className="text-vera-text-primary -mt-1"
        />
        <p className="text-vera-caption">{t('archiveList.download')}</p>
      </a>
    );
  }

  if (isPending(status)) {
    return (
      <CircularProgress
        size={20}
        data-testid="archive-loading-spinner"
        className="text-vera-primary"
      />
    );
  }

  return (
    <Tooltip title={t('archiveList.error.tooltip')}>
      <VividIcon
        name="warning-line"
        customSize={-6}
        data-testid="archive-error-icon"
        className="text-vera-warning"
      />
    </Tooltip>
  );
}

function isPending(status: string) {
  return ['started', 'stopped', 'uploaded', 'paused'].includes(status);
}

export default ArchiveList;
