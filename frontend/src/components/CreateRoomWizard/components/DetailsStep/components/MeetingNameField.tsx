import type { ChangeEvent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import Field from '@ui/components/Field';
import createRoomWizard$ from '../../../context/createRoomWizardContext';
import useIsMeetingNameValid from '../../../hooks/useIsMeetingNameValid';
import { testIds } from './meetingNameFieldTestIds';

export { testIds } from './meetingNameFieldTestIds';

/**
 * Optional meeting name. It becomes the room name, so it follows the same rules as a room name typed on the landing page.
 */
const MeetingNameField = (): ReactElement => {
  const { t } = useTranslation();
  const name = createRoomWizard$.use.select((state) => state.name);
  const { setName } = createRoomWizard$.use.actions();
  const hasError = !useIsMeetingNameValid();

  const handleChange = (changeEvent: ChangeEvent<HTMLInputElement>) => {
    setName(changeEvent.target.value.toLowerCase());
  };

  return (
    <Field>
      <Field.Label htmlFor="create-room-wizard-meeting-name">
        {t('createRoomWizard.details.name.label')}
      </Field.Label>
      <Field.Input
        data-testid={testIds.input}
        id="create-room-wizard-meeting-name"
        aria-invalid={hasError}
        aria-describedby="create-room-wizard-meeting-name-description"
        value={name}
        maxLength={60}
        autoComplete="off"
        onChange={handleChange}
      />
      <Field.Description
        id="create-room-wizard-meeting-name-description"
        className={classNames({ 'text-vera-error': hasError })}
      >
        {t('createRoomWizard.details.name.description')}
      </Field.Description>
    </Field>
  );
};

export default MeetingNameField;
