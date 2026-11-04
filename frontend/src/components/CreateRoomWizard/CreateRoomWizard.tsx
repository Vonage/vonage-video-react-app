import type { PropsWithChildren, ReactElement } from 'react';
import CreateRoomWizardDialog from './components/CreateRoomWizardDialog';
import CreateRoomWizardStep from './components/CreateRoomWizardStep';
import ShareStep from './components/ShareStep';
import createRoomWizard$ from './context/createRoomWizardContext';

export type CreateRoomWizardProps = PropsWithChildren<{
  sessionKey: string;
  onClose: () => void;
}>;

/**
 * Dialog shown after creating a meeting. Its steps are given as `CreateRoomWizard.Step` children.
 */
const CreateRoomWizard = ({
  sessionKey,
  onClose,
  children,
}: CreateRoomWizardProps): ReactElement => (
  <createRoomWizard$.Provider value={(state) => ({ ...state, sessionKey })}>
    <CreateRoomWizardDialog onClose={onClose}>{children}</CreateRoomWizardDialog>
  </createRoomWizard$.Provider>
);

CreateRoomWizard.Step = CreateRoomWizardStep;
CreateRoomWizard.ShareStep = ShareStep;

export default CreateRoomWizard;
