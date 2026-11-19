import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import useMeetingWhenLabel from '../../hooks/useMeetingWhenLabel';
import AccordionWizard from '../AccordionWizard';
import createRoomWizard$ from '../context/createRoomWizardContext';
import useDraftSchedule from '../hooks/useDraftSchedule';
import DetailsWhenSelect from '../steps/details/DetailsWhenSelect';
import ShareInvitePreview from '../steps/share/ShareInvitePreview';

/**
 * Wizard C: accordion shell, a "When" select for the schedule, a preview of the invitation that gets shared.
 */
const CreateRoomWizardC = (): ReactElement => {
  const { t } = useTranslation();
  const name = createRoomWizard$.use.select((state) => state.name);
  const whenLabel = useMeetingWhenLabel(useDraftSchedule());

  const detailsSummary = [name || t('meetingFlow.common.untitledMeeting'), whenLabel].join(' · ');

  return (
    <AccordionWizard>
      <AccordionWizard.Step step="details" summary={detailsSummary}>
        <DetailsWhenSelect />
      </AccordionWizard.Step>
      <AccordionWizard.Step step="share">
        <ShareInvitePreview />
      </AccordionWizard.Step>
    </AccordionWizard>
  );
};

export default CreateRoomWizardC;
