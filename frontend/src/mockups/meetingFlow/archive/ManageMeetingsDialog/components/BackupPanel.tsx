import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';
import Notice from '../../../components/Notice';

/**
 * Backup and restore tab: export with the meeting-link warning, import through a drop zone.
 */
const BackupPanel = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {t('meetingFlow.archive.exportTitle')}
        </h3>
        <p className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
          {t('meetingFlow.archive.exportDescription')}
        </p>
        <Notice tone="warning">{t('meetingFlow.archive.exportWarning')}</Notice>
        <div>
          <Button
            variant="contained"
            startIcon={
              <VividIcon
                name="download-line"
                customSize={-5}
                style={{ color: 'var(--vera-on-primary)' }}
              />
            }
          >
            {t('meetingFlow.archive.export')}
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {t('meetingFlow.archive.importTitle')}
        </h3>
        <p className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
          {t('meetingFlow.archive.importDescription')}
        </p>
        <button
          type="button"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-vera-large border-2 border-dashed border-vera-border bg-vera-background px-6 py-8 transition-colors hover:border-vera-primary"
        >
          <VividIcon
            name="upload-line"
            customSize={0}
            style={{ color: 'var(--vera-text-primary)' }}
          />
          <span className="font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
            {t('meetingFlow.archive.importDrop')}
          </span>
        </button>
      </section>
    </div>
  );
};

export default BackupPanel;
