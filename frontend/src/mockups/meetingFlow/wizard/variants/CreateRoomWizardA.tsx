import type { ReactElement } from 'react';
import SidebarWizard from '../SidebarWizard';
import DetailsChoiceCards from '../steps/details/DetailsChoiceCards';
import RolesSwitchList from '../steps/roles/RolesSwitchList';
import ShareLinkList from '../steps/share/ShareLinkList';

/**
 * Wizard A: sidebar shell, radio cards for the schedule, switches for roles, a link list to share.
 */
const CreateRoomWizardA = (): ReactElement => (
  <SidebarWizard>
    <SidebarWizard.Step step="details">
      <DetailsChoiceCards />
    </SidebarWizard.Step>
    <SidebarWizard.Step step="roles">
      <RolesSwitchList />
    </SidebarWizard.Step>
    <SidebarWizard.Step step="share">
      <ShareLinkList initialQrRole="publisher" />
    </SidebarWizard.Step>
  </SidebarWizard>
);

export default CreateRoomWizardA;
