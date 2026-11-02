import makeSampleLinks from '../../sampleData/makeSampleLinks';
import type { RoleLink } from '../../types/RoleLink';
import createRoomWizard$ from '../context/createRoomWizardContext';

const useLinkedRoles = createRoomWizard$.use.createSelectorHook(
  ({ hasExtraRoles, selectedRoles }) => (hasExtraRoles ? selectedRoles : [])
);

/**
 * Sample links for the meeting being created: the moderator link first, then one per selected role.
 */
const useDraftLinks = (): RoleLink[] => {
  const linkedRoles = useLinkedRoles();

  return makeSampleLinks({ seed: 'TmV3TWVldGluZw', roles: ['moderator', ...linkedRoles] });
};

export default useDraftLinks;
