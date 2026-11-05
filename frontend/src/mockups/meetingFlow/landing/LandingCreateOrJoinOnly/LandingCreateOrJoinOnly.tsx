import type { ReactElement } from 'react';
import CreateOrJoinCard from '../components/CreateOrJoinCard';
import LandingShell from '../components/LandingShell';

/**
 * Landing variant D before the meetings list ships: only the create-or-join card, with the "Room id" join field.
 */
const LandingCreateOrJoinOnly = (): ReactElement => {
  return (
    <LandingShell>
      <div className="flex w-full flex-col py-6 lg:max-w-125">
        <CreateOrJoinCard />
      </div>
    </LandingShell>
  );
};

export default LandingCreateOrJoinOnly;
