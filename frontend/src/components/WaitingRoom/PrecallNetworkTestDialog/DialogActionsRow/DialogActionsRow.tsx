import { ReactElement } from 'react';
import classNames from 'classnames';
import { Box, Button } from '@mui/material';

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
  const resolvedTextColor = textColor;
  const resolvedPrimaryTextColor = primaryTextColor;

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
        className={classNames({
          'text-vera-text-secondary': !resolvedTextColor,
        })}
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
        className={classNames({
          'text-vera-on-primary': !resolvedPrimaryTextColor,
        })}
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
