import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import useMeetingWhenLabel from '../../hooks/useMeetingWhenLabel';
import AccordionWizard from '../AccordionWizard';
import createRoomWizard$ from '../context/createRoomWizardContext';
import useDraftLinks from '../hooks/useDraftLinks';
import useDraftSchedule from '../hooks/useDraftSchedule';
import DetailsWhenSelect from '../steps/details/DetailsWhenSelect';
import RolesMatrix from '../steps/roles/RolesMatrix';
import ShareInviteCards from '../steps/share/ShareInviteCards';

/**
 * Wizard C: accordion shell, a "When" select for the schedule, a permission table, invitation cards.
 */
const CreateRoomWizardC = (): ReactElement => {
  const { t } = useTranslation();
  const name = createRoomWizard$.use.select((state) => state.name);
  const whenLabel = useMeetingWhenLabel(useDraftSchedule());
  const invitedRoles = useDraftLinks()
    .filter(({ role }) => role !== 'moderator')
    .map(({ role }) => t(`meetingFlow.role.${role}`));

  const detailsSummary = [name || t('meetingFlow.common.untitledMeeting'), whenLabel].join(' · ');
  const rolesSummary =
    invitedRoles.length === 0
      ? t('meetingFlow.landing.roles.moderatorOnly')
      : invitedRoles.join(', ');

  return (
    <AccordionWizard>
      <AccordionWizard.Step step="details" summary={detailsSummary}>
        <DetailsWhenSelect />
      </AccordionWizard.Step>
      <AccordionWizard.Step step="roles" summary={rolesSummary}>
        <RolesMatrix />
      </AccordionWizard.Step>
      <AccordionWizard.Step step="share">
        <ShareInviteCards />
      </AccordionWizard.Step>
    </AccordionWizard>
  );
};

export default CreateRoomWizardC;
