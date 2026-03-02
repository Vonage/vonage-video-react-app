import type { FC } from 'react';
import GoodBye from '@pages/GoodBye';

/**
 * GoodByeStage
 *
 * Embeddable version of the goodbye screen. Equivalent to GoodBye but without
 * the Vera chrome (Banner, Footer) and without the GoToLandingPageButton since
 * there is no landing page in the embed context.
 *
 * Re-enter the room button navigates back to /waiting-room/:roomName via
 * the parent MemoryRouter in VeraRoom.
 */
const GoodByeStage: FC = () => {
  return <GoodBye />;
};

export default GoodByeStage;
