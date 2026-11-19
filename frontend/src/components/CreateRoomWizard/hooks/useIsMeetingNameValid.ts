import { isValidRoomName } from '@common/assertions';
import createRoomWizard$ from '../context/createRoomWizardContext';

const useIsMeetingNameValid = createRoomWizard$.use.createSelectorHook(function isMeetingNameValid({
  name,
}): boolean {
  return name === '' || isValidRoomName(name);
});

export default useIsMeetingNameValid;
