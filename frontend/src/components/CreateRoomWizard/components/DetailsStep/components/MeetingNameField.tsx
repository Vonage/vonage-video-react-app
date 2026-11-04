import { useState, type ChangeEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { isValidRoomName } from '@common/assertions';
import InputField from '@ui/components/InputField';
import createRoomWizard$ from '../../../context/createRoomWizardContext';

/**
 * Optional meeting name. It becomes the room name, so it follows the same rules as a room name typed on the landing page.
 */
const MeetingNameField = (): ReactElement => {
  const { t } = useTranslation();
  const name = createRoomWizard$.use.select((state) => state.name);
  const { setName } = createRoomWizard$.use.actions();
  const [hasError, setHasError] = useState(false);

  const handleChange = (changeEvent: ChangeEvent<HTMLInputElement>) => {
    const newName = changeEvent.target.value.toLowerCase();
    const isAccepted = newName === '' || isValidRoomName(newName);

    setHasError(!isAccepted);
    if (isAccepted) setName(newName);
  };

  return (
    <InputField
      id="create-room-wizard-meeting-name"
      label={t('createRoomWizard.details.name.label')}
      description={t('createRoomWizard.details.name.description')}
      hasError={hasError}
      value={name}
      maxLength={60}
      autoComplete="off"
      onChange={handleChange}
    />
  );
};

export default MeetingNameField;
