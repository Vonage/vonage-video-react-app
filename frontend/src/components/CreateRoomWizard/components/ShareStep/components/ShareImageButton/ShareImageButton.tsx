import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';
import shareMeetingImage from './helpers/shareMeetingImage';

export type ShareImageButtonProps = {
  meetingLink: string;
};

/**
 * Shares the QR code of the meeting link as an image, or downloads it where sharing files is not supported.
 */
const ShareImageButton = ({ meetingLink }: ShareImageButtonProps): ReactElement => {
  const { t } = useTranslation();

  const shareImage = () => {
    void shareMeetingImage({ meetingLink, caption: t('createRoomWizard.share.scanToJoin') });
  };

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={shareImage}
      startIcon={
        <VividIcon name="image-line" customSize={-5} style={{ color: 'var(--vera-primary)' }} />
      }
    >
      {t('createRoomWizard.share.shareAsImage')}
    </Button>
  );
};

export default ShareImageButton;
