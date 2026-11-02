import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button, { type ButtonProps } from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';

/**
 * Shares the role's QR card as an image (Web Share API, download as fallback).
 */
const ShareImageButton = (
  props: Omit<ButtonProps, 'startIcon' | 'children' | 'sx'>
): ReactElement => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={
        <VividIcon name="image-line" customSize={-5} style={{ color: 'var(--vera-primary)' }} />
      }
      {...props}
    >
      {t('meetingFlow.common.shareImage')}
    </Button>
  );
};

export default ShareImageButton;
