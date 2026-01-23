import { ReactElement } from 'react';
import Box from '@ui/Box';
import Button from '@ui/Button';
import useTheme from '@ui/theme';

export type DialogActionsRowProps = {
  closeButtonText: string;
  onClose: () => void;
  primaryButtonText: string;
  onPrimaryClick: () => void;
  textColor?: string;
  primaryTextColor?: string;
};

const DialogActionsRow = function DialogActionsRow({
  closeButtonText,
  onClose,
  primaryButtonText,
  onPrimaryClick,
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
        onClick={onPrimaryClick}
        sx={{
          color: resolvedPrimaryTextColor,
          ml: 2,
        }}
      >
        {primaryButtonText}
      </Button>
    </Box>
  );
};

export default DialogActionsRow;
