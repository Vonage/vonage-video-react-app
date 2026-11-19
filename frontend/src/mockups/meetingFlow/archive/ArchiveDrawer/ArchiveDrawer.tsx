import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import VividIcon from '@ui/components/VividIcon';
import { useArchivedMeetings } from '../../stores/meetingsStore';
import ArchivedMeetingRow from '../components/ArchivedMeetingRow';
import ArchiveExportFooter from './components/ArchiveExportFooter';
import SelectionCheckbox from '../../components/SelectionCheckbox';
import archiveSelection$ from './context/archiveSelectionContext';

/**
 * Archive variant C: a side drawer over the landing page with search, per-meeting selection and a gated export.
 */
const ArchiveDrawer = (): ReactElement => {
  const { t } = useTranslation();
  const archivedMeetings = useArchivedMeetings();
  const selectedIds = archiveSelection$.use.select((state) => state.selectedIds);
  const { toggle, setAll } = archiveSelection$.use.actions();
  const isEverythingSelected = selectedIds.length === archivedMeetings.length;

  return (
    <Drawer
      open
      anchor="right"
      slotProps={{ paper: { className: 'w-dvw bg-vera-surface! sm:w-110' } }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-vera-border px-6 py-4">
          <h2 className="font-vera-plain text-vera-heading-4 text-vera-text-secondary">
            {t('meetingFlow.archive.title')}
          </h2>
          <IconButton aria-label={t('meetingFlow.wizard.close')}>
            <VividIcon name="close-line" customSize={-5} />
          </IconButton>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
          <TextField
            size="small"
            fullWidth
            placeholder={t('meetingFlow.archive.search')}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <VividIcon
                      name="search-line"
                      customSize={-5}
                      style={{ color: 'var(--vera-text-tertiary)' }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
          <label className="flex cursor-pointer items-center gap-3 font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
            <SelectionCheckbox
              checked={isEverythingSelected}
              onChange={() =>
                setAll(isEverythingSelected ? [] : archivedMeetings.map(({ id }) => id))
              }
            />
            {t('meetingFlow.archive.selectAll')}
          </label>
          <ul className="flex flex-col">
            {archivedMeetings.map((meeting) => (
              <ArchivedMeetingRow
                key={meeting.id}
                meeting={meeting}
                leading={
                  <SelectionCheckbox
                    aria-label={meeting.name ?? t('meetingFlow.common.untitledMeeting')}
                    checked={selectedIds.includes(meeting.id)}
                    onChange={() => toggle(meeting.id)}
                  />
                }
              />
            ))}
          </ul>
        </div>
        <ArchiveExportFooter />
      </div>
    </Drawer>
  );
};

export default ArchiveDrawer;
