import { ReactElement } from 'react';
import Box from '@ui/Box';
import Button from '@ui/Button';
import useTheme from '@ui/theme';

export type DialogActionsRowProps = {
  closeButtonText: string;
  onClose: () => void;
  actionButtonText: string;
  onActionClick: () => void;
  textColor?: string;
  primaryTextColor?: string;
};

const DialogActionsRow = function DialogActionsRow({
  closeButtonText,
  onClose,
  actionButtonText,
  onActionClick,
  textColor,
  primaryTextColor,
}: DialogActionsRowProps): ReactElement {
  const theme = useTheme();

  const resolvedTextColor = textColor ?? theme.colors.textSecondary;
  const resolvedPrimaryTextColor = primaryTextColor ?? theme.colors.onPrimary;

  return (
    <Box
      sx={{
        display: 'flex',
        p: 2,
        justifyContent: 'end',
      }}
    >
      <Button
        variant="text"
        onClick={onClose}
        sx={{
          mr: 1,
          color: resolvedTextColor,
        }}
      >
        {closeButtonText}
      </Button>
      <Button
        variant="contained"
        onClick={onActionClick}
        sx={{
          color: resolvedPrimaryTextColor,
          minWidth: 100,
          ml: 1,
        }}
      >
        {actionButtonText}
      </Button>
    </Box>
  );
};

export default DialogActionsRow;
