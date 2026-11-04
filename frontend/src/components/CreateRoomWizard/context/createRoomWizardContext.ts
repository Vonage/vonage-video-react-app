import createContext from 'react-global-state-hooks/createContext';
import type { CreateRoomWizardStepName } from '../types/CreateRoomWizardStepName';

/**
 * The meeting being created and the wizard step on screen. One instance per open wizard.
 */
const createRoomWizard$ = createContext(() => ({
  activeStep: 'share' as CreateRoomWizardStepName,
  sessionKey: '',
}));

export default createRoomWizard$;
