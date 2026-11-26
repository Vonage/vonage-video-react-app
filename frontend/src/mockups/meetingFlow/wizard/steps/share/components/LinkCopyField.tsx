import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { twMerge } from 'tailwind-merge';
import VividIcon from '@ui/components/VividIcon';

export type LinkCopyFieldProps = ComponentProps<'div'> & {
  url: string;
};

/**
 * Read-only link box with an inline copy button.
 */
const LinkCopyField = ({ url, className, ...props }: LinkCopyFieldProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <div
      className={twMerge(
        'flex min-w-0 items-center gap-2 rounded-vera-medium border border-vera-border bg-vera-surface py-1 pl-3 pr-1',
        className
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate font-vera-plain text-vera-body-base text-vera-text-tertiary">
        {url}
      </span>
      <Tooltip title={t('meetingFlow.common.copy')}>
        <IconButton size="small" aria-label={t('meetingFlow.common.copy')}>
          <VividIcon
            name="copy-line"
            customSize={-5}
            style={{ color: 'var(--vera-text-primary)' }}
          />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default LinkCopyField;
