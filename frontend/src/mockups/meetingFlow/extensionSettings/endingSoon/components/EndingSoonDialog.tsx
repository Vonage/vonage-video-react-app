import type { PropsWithChildren, ReactElement, ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';
import useMeetingTabCopy from '../../hooks/useMeetingTabCopy';

export type EndingSoonDialogProps = PropsWithChildren<{
  actions: ReactNode;
}>;

/**
 * Central popup in the shape of the meeting room's PopupDialog: title, content, then actions.
 */
const EndingSoonDialog = ({ actions, children }: EndingSoonDialogProps): ReactElement => {
  const { t } = useTranslation();
  const { minutesLeft } = useMeetingTabCopy();

  return (
    <Dialog
      open
      maxWidth="xs"
      fullWidth
      aria-labelledby="mockup-ending-soon-title"
      slotProps={{
        paper: {
          className: 'bg-vera-surface! rounded-vera-large! dark:border dark:border-vera-border',
        },
      }}
    >
      <DialogTitle
        id="mockup-ending-soon-title"
        className="font-vera-plain text-vera-heading-4! text-vera-text-secondary"
      >
        {t('meetingFlow.endingSoon.title', { count: minutesLeft })}
      </DialogTitle>
      <DialogContent className="flex flex-col gap-4 pb-2!">{children}</DialogContent>
      <DialogActions className="px-6! pb-5!">{actions}</DialogActions>
    </Dialog>
  );
};

export default EndingSoonDialog;
