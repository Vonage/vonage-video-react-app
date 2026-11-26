import type { PropsWithChildren, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import classNames from 'classnames';
import { tv } from 'tailwind-variants';
import VividIcon from '@ui/components/VividIcon';
import DialogFrameFooter from './components/DialogFrameFooter';

export type DialogFrameProps = PropsWithChildren<{
  title: string;
  size: 'tall' | 'compact';
  onClose?: () => void;
}>;

const paper = tv({
  base: 'm-0! h-dvh! max-h-dvh! w-full! max-w-none! overflow-hidden rounded-none! bg-vera-surface sm:m-8! sm:w-[calc(100%-4rem)]! sm:rounded-vera-large! dark:border dark:border-vera-border',
  variants: {
    size: {
      tall: 'sm:h-[640px]! sm:max-h-[640px]! md:max-w-3xl!',
      compact: 'sm:h-auto! sm:max-h-[calc(100dvh-4rem)]! md:max-w-xl!',
    },
  },
});

/**
 * Dialog chrome copied from the Advanced settings dialog: full screen on phones, rounded panel from `sm` up.
 */
const DialogFrame = ({ title, size, onClose, children }: DialogFrameProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { className: paper({ size }) } }}
    >
      <div className="flex h-full flex-col bg-vera-surface">
        <div className="relative border-b border-vera-border bg-vera-surface px-6 pb-4 pt-6">
          <h2 className="pr-10 font-vera-plain text-vera-heading-2 text-vera-text-secondary">
            {title}
          </h2>
          <button
            type="button"
            aria-label={t('meetingFlow.wizard.close')}
            onClick={onClose}
            className={classNames(
              'cursor-pointer absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full',
              'text-vera-secondary transition-colors hover:bg-vera-background'
            )}
          >
            <VividIcon name="close-line" customSize={-5} />
          </button>
        </div>
        {children}
      </div>
    </Dialog>
  );
};

/**
 * Bottom action bar of the dialog.
 */
DialogFrame.Footer = DialogFrameFooter;

export default DialogFrame;
