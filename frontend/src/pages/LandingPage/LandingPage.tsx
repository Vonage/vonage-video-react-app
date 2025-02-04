import { ReactElement } from 'react';
import Banner from '../../components/Banner';
import LandingPageWelcome from '../../components/LandingPageWelcome';
import RoomJoinContainer from '../../components/RoomJoinContainer';

/**
 * LandingPage Component
 *
 * This component renders the landing page of the application, including:
 * - A banner containing a company logo, a date-time widget, and a navigable button to a GitHub repo.
 * - A welcome message for users.
 * - A form allowing users to:
 *   - Quickly join the waiting room for a randomly generated room name and session ID.
 *   - Join the waiting room for a specific room name.
 * @returns {ReactElement} - The landing page.
 */
const LandingPage = (): ReactElement => {
  return (
    <div className="bg-white flex h-full w-full justify-between flex-col">
      <Banner />

      <div className="bg-white flex w-full h-full items-center md:justify-center flex-col md:flex-row">
        <LandingPageWelcome />

        <RoomJoinContainer />
      </div>
    </div>
  );
};

export default LandingPage;
