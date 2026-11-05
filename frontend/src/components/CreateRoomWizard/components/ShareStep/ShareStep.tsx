import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import LinkCopyField from './components/LinkCopyField';

const ShareStep = (): ReactElement => {
  const { t } = useTranslation();
  const sessionKey = createRoomWizard$.use.select((state) => state.sessionKey);
  const meetingLink = `${window.location.origin}/waiting-room/${sessionKey}`;

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
      </div>
      <p className="font-vera-plain text-vera-caption text-vera-text-tertiary">
        {t('createRoomWizard.share.notSavedHint')}
      </p>
    </div>
  );
};

export default ShareStep;
