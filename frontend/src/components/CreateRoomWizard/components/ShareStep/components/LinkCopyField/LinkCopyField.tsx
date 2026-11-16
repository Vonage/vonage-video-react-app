import { useEffect, useId, useRef, useState, type ComponentProps, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import tryCatch from '@common/execution/tryCatch';
import VividIcon from '@ui/components/VividIcon';
import { testIds } from './testIds';

export { testIds } from './testIds';

export type LinkCopyFieldProps = ComponentProps<'div'> & {
  url: string;
};

const LinkCopyField = ({ url, className, ...props }: LinkCopyFieldProps): ReactElement => {
  const { t } = useTranslation();
  const [isCopied, setIsCopied] = useState(false);
  const tooltipId = useId();
  const copyConfirmationTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(function clearCopyConfirmationOnUnmount() {
    return () => clearTimeout(copyConfirmationTimer.current);
  }, []);

  const copyLabel = isCopied
    ? t('createRoomWizard.share.linkCopied')
    : t('createRoomWizard.share.copyLink');

  const copyLink = async () => {
    const { didFail } = await tryCatch(() => navigator.clipboard.writeText(url));
    if (didFail) return;

    setIsCopied(true);
    clearTimeout(copyConfirmationTimer.current);
    copyConfirmationTimer.current = setTimeout(() => setIsCopied(false), 3000);
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
        data-testid={testIds.link}
        title={url}
        className="min-w-0 flex-1 truncate font-vera-plain text-vera-body-base text-vera-text-tertiary"
      >
        {url}
      </span>
      <div className="group relative flex shrink-0">
        <button
          type="button"
          data-testid={testIds.copyButton}
          aria-label={copyLabel}
          aria-describedby={tooltipId}
          className="flex size-[30px] cursor-pointer items-center justify-center rounded-full hover:bg-vera-text-primary/5"
          onClick={copyLink}
        >
          <VividIcon
            name={isCopied ? 'check-sent-line' : 'copy-line'}
            customSize={-5}
            style={{ color: isCopied ? 'var(--vera-success)' : 'var(--vera-text-primary)' }}
          />
        </button>
        <span
          id={tooltipId}
          role="tooltip"
          data-testid={testIds.tooltip}
          className="invisible absolute right-0 top-full z-10 mt-3 whitespace-nowrap rounded bg-vera-tertiary px-2 py-1 font-vera-plain text-[11px] font-medium text-vera-on-tertiary group-hover:visible group-focus-within:visible"
        >
          {copyLabel}
        </span>
      </div>
    </div>
  );
};

export default LinkCopyField;
