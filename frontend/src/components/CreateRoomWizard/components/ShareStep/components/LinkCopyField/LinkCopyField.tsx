import { useState, type ComponentProps, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { twMerge } from 'tailwind-merge';
import tryCatch from '@common/execution/tryCatch';
import VividIcon from '@ui/components/VividIcon';

export type LinkCopyFieldProps = ComponentProps<'div'> & {
  url: string;
};

const LinkCopyField = ({ url, className, ...props }: LinkCopyFieldProps): ReactElement => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const copyLabel = isCopied
    ? t('createRoomWizard.share.linkCopied')
    : t('createRoomWizard.share.copyLink');

  const copyLink = async () => {
    const { didFail } = await tryCatch(() => navigator.clipboard.writeText(url));
    if (didFail) return;
    setIsCopied(true);
  };

  return (
    <div
      className={twMerge(
        'flex min-w-0 items-center gap-2 rounded-vera-medium border border-vera-border bg-vera-surface py-1 pl-3 pr-1',
        className
      )}
      {...props}
    >
      <span
        title={url}
        className="min-w-0 flex-1 truncate font-vera-plain text-vera-body-base text-vera-text-tertiary"
      >
        {url}
      </span>
      <Tooltip title={copyLabel}>
        <IconButton size="small" aria-label={copyLabel} onClick={copyLink}>
          <VividIcon
            name={isCopied ? 'check-sent-line' : 'copy-line'}
            customSize={-5}
            style={{ color: isCopied ? 'var(--vera-success)' : 'var(--vera-text-primary)' }}
          />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default LinkCopyField;
