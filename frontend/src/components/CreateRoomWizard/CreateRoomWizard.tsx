import type { PropsWithChildren, ReactElement } from 'react';
import CreateRoomWizardDialog from './components/CreateRoomWizardDialog';
import CreateRoomWizardStep from './components/CreateRoomWizardStep';
import DetailsStep from './components/DetailsStep';
import ShareStep from './components/ShareStep';
import createRoomWizard$ from './context/createRoomWizardContext';

export type CreateRoomWizardProps = PropsWithChildren<{
  onClose: () => void;
}>;

/**
 * Dialog that creates a meeting and shows its link. Its steps are given as `CreateRoomWizard.Step` children.
 */
const CreateRoomWizard = ({ onClose, children }: CreateRoomWizardProps): ReactElement => (
  <createRoomWizard$.Provider>
    <CreateRoomWizardDialog onClose={onClose}>{children}</CreateRoomWizardDialog>
  </createRoomWizard$.Provider>
);

CreateRoomWizard.Step = CreateRoomWizardStep;
CreateRoomWizard.DetailsStep = DetailsStep;
CreateRoomWizard.ShareStep = ShareStep;

export default CreateRoomWizard;
