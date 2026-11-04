import { useId, type PropsWithChildren, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import classNames from 'classnames';
import VividIcon from '@ui/components/VividIcon';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import { getStepPanels } from '../CreateRoomWizardStep';
import CreateRoomWizardFooterActions from '../CreateRoomWizardFooterActions';

export type CreateRoomWizardDialogProps = PropsWithChildren<{
  onClose: () => void;
}>;

const paperClassName = classNames(
  'm-0! h-dvh! max-h-dvh! w-full! max-w-none! overflow-hidden rounded-none! bg-vera-surface',
  'sm:m-8! sm:h-auto! sm:max-h-[calc(100dvh-4rem)]! sm:w-[calc(100%-4rem)]! sm:rounded-vera-large! md:max-w-xl!',
  'dark:border dark:border-vera-border'
);

/**
 * Compact dialog chrome of the wizard: full screen on phones, a rounded panel from `sm` up, showing the active step.
 */
const CreateRoomWizardDialog = ({
  onClose,
  children,
}: CreateRoomWizardDialogProps): ReactElement => {
  const { t } = useTranslation();
  const titleId = useId();
  const activeStep = createRoomWizard$.use.select((state) => state.activeStep);
  const activePanel = getStepPanels(children).find(({ props }) => props.step === activeStep);

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby={titleId}
      slotProps={{ paper: { className: paperClassName } }}
    >
      <div className="flex h-full flex-col bg-vera-surface">
        <div className="relative border-b border-vera-border bg-vera-surface px-6 pb-4 pt-6">
          <h2
            id={titleId}
            className="pr-10 font-vera-plain text-vera-heading-2 text-vera-text-secondary"
          >
            {t('createRoomWizard.title')}
          </h2>
          <button
            type="button"
            aria-label={t('button.close')}
            onClick={onClose}
            className={classNames(
              'cursor-pointer absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full',
              'text-vera-secondary transition-colors hover:bg-vera-background'
            )}
          >
            <VividIcon name="close-line" customSize={-5} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{activePanel}</div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-vera-border px-6 py-4">
          <CreateRoomWizardFooterActions onClose={onClose} />
        </div>
      </div>
    </Dialog>
  );
};

export default CreateRoomWizardDialog;
