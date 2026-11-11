import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';
import Notice from '../../../components/Notice';
import disabledButtonClassName from '../../../constants/disabledButtonClassName';
import archiveSelection$ from '../context/archiveSelectionContext';
import SelectionCheckbox from '../../../components/SelectionCheckbox';

/**
 * Sticky drawer footer: the warning must be acknowledged before the selected meetings can be exported.
 */
const ArchiveExportFooter = (): ReactElement => {
  const { t } = useTranslation();
  const selectedCount = archiveSelection$.use.select((state) => state.selectedIds.length);
  const isWarningAcknowledged = archiveSelection$.use.select(
    (state) => state.isWarningAcknowledged
  );
  const { setWarningAcknowledged } = archiveSelection$.use.actions();
  const canExport = selectedCount > 0 && isWarningAcknowledged;

  return (
    <div className="flex flex-col gap-3 border-t border-vera-border bg-vera-surface px-6 py-4">
      <Notice tone="warning">
        <div className="flex flex-col gap-2">
          <span>{t('meetingFlow.archive.exportWarning')}</span>
          <label className="flex cursor-pointer items-center gap-2 font-vera-plain text-vera-body-base-semibold">
            <SelectionCheckbox
              checked={isWarningAcknowledged}
              onChange={(event) => setWarningAcknowledged(event.currentTarget.checked)}
            />
            {t('meetingFlow.archive.exportAcknowledge')}
          </label>
        </div>
      </Notice>
      <div className="flex flex-wrap justify-end gap-3">
        <Button
          variant="outlined"
          startIcon={
            <VividIcon
              name="upload-line"
              customSize={-5}
              style={{ color: 'var(--vera-primary)' }}
            />
          }
        >
          {t('meetingFlow.archive.import')}
        </Button>
        <Button
          variant="contained"
          disabled={!canExport}
          className={disabledButtonClassName}
          startIcon={
            <VividIcon
              name="download-line"
              customSize={-5}
              style={{ color: canExport ? 'var(--vera-on-primary)' : 'var(--vera-text-disabled)' }}
            />
          }
        >
          {t('meetingFlow.archive.exportSelected', { count: selectedCount })}
        </Button>
      </div>
    </div>
  );
};

export default ArchiveExportFooter;
