import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import SelectionCheckbox from '../../../../components/SelectionCheckbox';
import createRoomWizard$ from '../../../context/createRoomWizardContext';

/**
 * Checkbox that unlocks the extra roles, with its explanation.
 */
const ExtraRolesCheck = (): ReactElement => {
  const { t } = useTranslation();
  const hasExtraRoles = createRoomWizard$.use.select((state) => state.hasExtraRoles);
  const { setHasExtraRoles } = createRoomWizard$.use.actions();

  return (
    <label className="flex cursor-pointer items-start gap-3">
      <SelectionCheckbox
        className="mt-1"
        checked={hasExtraRoles}
        onChange={(event) => setHasExtraRoles(event.currentTarget.checked)}
      />
      <span className="flex flex-col gap-1">
        <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
          {t('meetingFlow.wizard.roles.switch')}
        </span>
        <span className="font-vera-plain text-vera-body-base text-vera-text-tertiary">
          {t('meetingFlow.wizard.roles.switchDescription')}
        </span>
      </span>
    </label>
  );
};

export default ExtraRolesCheck;
