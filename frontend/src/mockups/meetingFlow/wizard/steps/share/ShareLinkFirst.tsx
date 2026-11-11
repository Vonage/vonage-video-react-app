import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';
import QrPlaceholder from '../../../components/QrPlaceholder';
import draftMeetingLink from '../../constants/draftMeetingLink';
import LinkCopyField from './components/LinkCopyField';
import ShareImageButton from './components/ShareImageButton';
import ShareMeetingHeader from './components/ShareMeetingHeader';

/**
 * Share variant A: the meeting link first, with copy and share-as-image; the QR code unfolds below on demand.
 */
const ShareLinkFirst = ({ isQrInitiallyOpen }: { isQrInitiallyOpen: boolean }): ReactElement => {
  const { t } = useTranslation();
  const [isQrOpen, setIsQrOpen] = useState(isQrInitiallyOpen);

  return (
    <div className="flex flex-col gap-5">
      <ShareMeetingHeader />
      <div className="flex flex-col gap-3 rounded-vera-large border border-vera-border p-4">
        <span className="font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
          {t('meetingFlow.wizard.share.linkLabel')}
        </span>
        <LinkCopyField url={draftMeetingLink} />
        <div className="flex flex-wrap gap-2">
          <ShareImageButton />
          <Button
            variant="text"
            size="small"
            onClick={() => setIsQrOpen(!isQrOpen)}
            endIcon={
              <VividIcon
                name={isQrOpen ? 'chevron-up-line' : 'chevron-down-line'}
                customSize={-6}
                style={{ color: 'var(--vera-primary)' }}
              />
            }
          >
            {isQrOpen ? t('meetingFlow.wizard.share.hideQr') : t('meetingFlow.wizard.share.showQr')}
          </Button>
        </div>
        {isQrOpen && (
          <div className="flex items-center gap-4 rounded-vera-medium bg-vera-background p-3">
            <QrPlaceholder
              seed={draftMeetingLink}
              label={t('meetingFlow.common.qrPlaceholder')}
              className="w-28 shrink-0"
            />
            <span className="font-vera-plain text-vera-body-base text-vera-text-secondary">
              {t('meetingFlow.wizard.share.scanHint')}
            </span>
          </div>
        )}
      </div>
      <p className="font-vera-plain text-vera-caption text-vera-text-tertiary">
        {t('meetingFlow.wizard.share.savedHint')}
      </p>
    </div>
  );
};

export default ShareLinkFirst;
