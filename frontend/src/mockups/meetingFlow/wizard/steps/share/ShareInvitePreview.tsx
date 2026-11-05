import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import VividIcon from '@ui/components/VividIcon';
import QrPlaceholder from '../../../components/QrPlaceholder';
import useMeetingWhenLabel from '../../../hooks/useMeetingWhenLabel';
import draftMeetingLink from '../../constants/draftMeetingLink';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import useDraftSchedule from '../../hooks/useDraftSchedule';
import ShareImageButton from './components/ShareImageButton';

/**
 * Share variant C: a preview of the invitation people receive (name, when, link and QR), with copy and share-as-image under it.
 */
const ShareInvitePreview = (): ReactElement => {
  const { t } = useTranslation();
  const name = createRoomWizard$.use.select((state) => state.name);
  const schedule = useDraftSchedule();
  const whenLabel = useMeetingWhenLabel(schedule);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {t('meetingFlow.wizard.share.title')}
        </span>
        <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
          {t('meetingFlow.wizard.share.previewLabel')}
        </span>
      </div>
      <figure className="flex items-center gap-4 rounded-vera-large border border-vera-primary bg-vera-background p-4">
        <figcaption className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-vera-plain text-vera-caption-semibold text-vera-text-primary">
            {t('meetingFlow.wizard.share.invitationTitle')}
          </span>
          <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
            {name || t('meetingFlow.common.untitledMeeting')}
          </span>
          <span className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
            {whenLabel}
          </span>
          <span className="truncate font-vera-plain text-vera-caption text-vera-text-tertiary">
            {draftMeetingLink}
          </span>
        </figcaption>
        <QrPlaceholder
          seed={draftMeetingLink}
          label={t('meetingFlow.common.qrPlaceholder')}
          className="w-24 shrink-0 border border-vera-border"
        />
      </figure>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="contained"
          size="small"
          startIcon={
            <VividIcon
              name="copy-line"
              customSize={-5}
              style={{ color: 'var(--vera-on-primary)' }}
            />
          }
        >
          {t('meetingFlow.common.copy')}
        </Button>
        <ShareImageButton />
      </div>
      <p className="font-vera-plain text-vera-caption text-vera-text-tertiary">
        {schedule
          ? t('meetingFlow.wizard.share.description')
          : t('meetingFlow.wizard.share.descriptionUnscheduled')}
      </p>
    </div>
  );
};

export default ShareInvitePreview;
