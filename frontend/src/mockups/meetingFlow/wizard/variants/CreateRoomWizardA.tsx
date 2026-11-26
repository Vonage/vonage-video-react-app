import type { ReactElement } from 'react';
import SidebarWizard from '../SidebarWizard';
import DetailsChoiceCards from '../steps/details/DetailsChoiceCards';
import ShareLinkFirst from '../steps/share/ShareLinkFirst';

/**
 * Wizard A: sidebar shell, radio cards for the schedule, the link first with the QR code on demand.
 */
const CreateRoomWizardA = (): ReactElement => (
  <SidebarWizard>
    <SidebarWizard.Step step="details">
      <DetailsChoiceCards />
    </SidebarWizard.Step>
    <SidebarWizard.Step step="share">
      <ShareLinkFirst isQrInitiallyOpen />
    </SidebarWizard.Step>
  </SidebarWizard>
);

export default CreateRoomWizardA;
