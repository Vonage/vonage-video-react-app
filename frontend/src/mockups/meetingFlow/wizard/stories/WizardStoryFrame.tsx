import type { ComponentType, ReactElement } from 'react';
import LandingStackedCards from '../../landing/LandingStackedCards';
import createRoomWizard$ from '../context/createRoomWizardContext';
import type { CreateRoomWizardState } from '../context/getInitialWizardState';

export type WizardStoryFrameProps = {
  wizard: ComponentType;
  state: Partial<CreateRoomWizardState>;
};

/**
 * Renders a wizard variant over the landing page, starting from the given draft state.
 */
const WizardStoryFrame = ({ wizard: Wizard, state }: WizardStoryFrameProps): ReactElement => {
  return (
    <>
      <LandingStackedCards />
      <createRoomWizard$.Provider value={(initialState) => ({ ...initialState, ...state })}>
        <Wizard />
      </createRoomWizard$.Provider>
    </>
  );
};

export default WizardStoryFrame;
