import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import QrPlaceholder from '../../../components/QrPlaceholder';
import draftMeetingLink from '../../constants/draftMeetingLink';
import LinkCopyField from './components/LinkCopyField';
import ShareImageButton from './components/ShareImageButton';
import ShareMeetingHeader from './components/ShareMeetingHeader';

/**
 * Share variant B: a large QR code first, ready to be scanned from the screen; the link to copy sits underneath.
 */
const ShareQrFirst = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5 sm:gap-4">
      <ShareMeetingHeader />
      <div className="flex flex-col items-center gap-4 rounded-vera-large bg-vera-background p-6 sm:gap-3 sm:p-4">
        <QrPlaceholder
          seed={draftMeetingLink}
          label={t('meetingFlow.common.qrPlaceholder')}
          className="w-56 max-w-full border border-vera-border sm:w-36"
        />
        <span className="text-center font-vera-plain text-vera-body-base text-vera-text-secondary">
          {t('meetingFlow.wizard.share.scanHint')}
        </span>
        <ShareImageButton />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {t('meetingFlow.wizard.share.orCopy')}
        </span>
        <LinkCopyField url={draftMeetingLink} />
      </div>
    </div>
  );
};

export default ShareQrFirst;
