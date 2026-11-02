import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Field from '@ui/components/Field';
import VividIcon from '@ui/components/VividIcon';
import Notice from '../../../components/Notice';
import inviteeRoles from '../../../constants/inviteeRoles';
import roleIconName from '../../../constants/roleIconName';
import createRoomWizard$ from '../../context/createRoomWizardContext';

/**
 * Roles variant A: Advanced-settings style switches, one per role, behind a master switch.
 */
const RolesSwitchList = (): ReactElement => {
  const { t } = useTranslation();
  const hasExtraRoles = createRoomWizard$.use.select((state) => state.hasExtraRoles);
  const selectedRoles = createRoomWizard$.use.select((state) => state.selectedRoles);
  const { setHasExtraRoles, toggleRole } = createRoomWizard$.use.actions();

  return (
    <div className="flex flex-col gap-6">
      <Field>
        <Field.Label htmlFor="mockup-extra-roles">
          {t('meetingFlow.wizard.roles.switch')}
        </Field.Label>
        <Field.Input
          variant="switch"
          id="mockup-extra-roles"
          checked={hasExtraRoles}
          onChange={(event) => setHasExtraRoles(event.currentTarget.checked)}
        />
        <Field.Description>{t('meetingFlow.wizard.roles.switchDescription')}</Field.Description>
      </Field>
      {hasExtraRoles && (
        <div className="flex flex-col gap-5 rounded-vera-large bg-vera-background p-4">
          {inviteeRoles.map((role) => (
            <Field key={role}>
              <Field.Label htmlFor={`mockup-role-${role}`} className="flex items-center gap-2">
                <VividIcon name={roleIconName[role]} customSize={-5} />
                {t(`meetingFlow.role.${role}`)}
              </Field.Label>
              <Field.Input
                variant="switch"
                id={`mockup-role-${role}`}
                checked={selectedRoles.includes(role)}
                onChange={() => toggleRole(role)}
              />
              <Field.Description>{t(`meetingFlow.role.${role}.description`)}</Field.Description>
            </Field>
          ))}
        </div>
      )}
      <Notice tone="information">{t('meetingFlow.wizard.roles.moderatorNote')}</Notice>
    </div>
  );
};

export default RolesSwitchList;
