import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import QrCode from '@ui/components/QrCode';
import VividIcon from '@ui/components/VividIcon';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import LinkCopyField from './components/LinkCopyField';
import ShareImageButton from './components/ShareImageButton';

const ShareStep = (): ReactElement => {
  const { t } = useTranslation();
  const sessionKey = createRoomWizard$.use.select((state) => state.sessionKey);
  const meetingLink = `${window.location.origin}/waiting-room/${sessionKey}`;
  const [isQrCodeOpen, setIsQrCodeOpen] = useState(true);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-vera-success/10">
          <VividIcon
            name="check-circle-line"
            customSize={-4}
            style={{ color: 'var(--vera-success)' }}
          />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
            {t('createRoomWizard.share.title')}
          </span>
          <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
            {t('createRoomWizard.share.description')}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-vera-large border border-vera-border p-4">
        <span className="font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
          {t('createRoomWizard.share.linkLabel')}
        </span>
        <LinkCopyField url={meetingLink} />
        <div className="flex flex-wrap gap-2">
          <ShareImageButton meetingLink={meetingLink} />
          <Button
            variant="text"
            size="small"
            onClick={() => setIsQrCodeOpen(!isQrCodeOpen)}
            endIcon={
              <VividIcon
                name={isQrCodeOpen ? 'chevron-up-line' : 'chevron-down-line'}
                customSize={-6}
                style={{ color: 'var(--vera-primary)' }}
              />
            }
          >
            {isQrCodeOpen
              ? t('createRoomWizard.share.hideQrCode')
              : t('createRoomWizard.share.showQrCode')}
          </Button>
        </div>
        {isQrCodeOpen && (
          <div className="flex items-center gap-4 rounded-vera-medium bg-vera-background p-3">
            <QrCode
              value={meetingLink}
              aria-label={t('createRoomWizard.share.qrCodeLabel')}
              className="w-40 shrink-0 rounded-vera-small"
            />
            <span className="font-vera-plain text-vera-body-base text-vera-text-secondary">
              {t('createRoomWizard.share.scanToJoin')}
            </span>
          </div>
        )}
      </div>
      <p className="font-vera-plain text-vera-caption text-vera-text-tertiary">
        {t('createRoomWizard.share.notSavedHint')}
      </p>
    </div>
  );
};

export default ShareStep;
