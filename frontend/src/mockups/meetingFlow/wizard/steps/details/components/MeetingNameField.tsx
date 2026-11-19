import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import StackedInputField from '../../../../components/StackedInputField';
import createRoomWizard$ from '../../../context/createRoomWizardContext';

/**
 * Optional meeting name. It is a label for the owner, not an identifier.
 */
const MeetingNameField = (): ReactElement => {
  const { t } = useTranslation();
  const name = createRoomWizard$.use.select((state) => state.name);
  const { setName } = createRoomWizard$.use.actions();

  return (
    <StackedInputField
      id="mockup-meeting-name"
      label={`${t('meetingFlow.wizard.details.name.label')} (${t('meetingFlow.wizard.optional')})`}
      description={t('meetingFlow.wizard.details.name.helper')}
      value={name}
      maxLength={60}
      onChange={(event) => setName(event.target.value)}
    />
  );
};

export default MeetingNameField;
