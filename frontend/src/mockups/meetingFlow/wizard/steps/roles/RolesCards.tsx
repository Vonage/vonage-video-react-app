import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import VividIcon from '@ui/components/VividIcon';
import Notice from '../../../components/Notice';
import inviteeRoles from '../../../constants/inviteeRoles';
import roleCapabilities, { type RoleCapability } from '../../../constants/roleCapabilities';
import roleIconName from '../../../constants/roleIconName';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import ExtraRolesCheck from './components/ExtraRolesCheck';

const capabilities: RoleCapability[] = ['send', 'receive'];

/**
 * Roles variant B: one selectable card per role, each listing what that person can and cannot do.
 */
const RolesCards = (): ReactElement => {
  const { t } = useTranslation();
  const hasExtraRoles = createRoomWizard$.use.select((state) => state.hasExtraRoles);
  const selectedRoles = createRoomWizard$.use.select((state) => state.selectedRoles);
  const { toggleRole } = createRoomWizard$.use.actions();

  return (
    <div className="flex flex-col gap-6">
      <ExtraRolesCheck />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {inviteeRoles.map((role) => {
          const isSelected = hasExtraRoles && selectedRoles.includes(role);

          return (
            <button
              key={role}
              type="button"
              aria-pressed={isSelected}
              disabled={!hasExtraRoles}
              onClick={() => toggleRole(role)}
              className={classNames(
                'relative flex cursor-pointer flex-col gap-3 rounded-vera-large border-2 bg-vera-surface p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                {
                  'border-vera-primary': isSelected,
                  'border-vera-border hover:border-vera-primary': !isSelected,
                }
              )}
            >
              <span className="flex w-full items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-full bg-vera-background">
                  <VividIcon
                    name={roleIconName[role]}
                    customSize={-5}
                    style={{ color: 'var(--vera-text-primary)' }}
                  />
                </span>
                <span
                  className={classNames(
                    'flex size-5 items-center justify-center rounded-full border',
                    {
                      'border-vera-primary bg-vera-primary': isSelected,
                      'border-vera-border': !isSelected,
                    }
                  )}
                >
                  {isSelected && (
                    <VividIcon
                      name="check-line"
                      customSize={-6}
                      style={{ color: 'var(--vera-on-primary)' }}
                    />
                  )}
                </span>
              </span>
              <span className="font-vera-plain text-vera-body-extended-semibold text-vera-text-secondary">
                {t(`meetingFlow.role.${role}`)}
              </span>
              <span className="font-vera-plain text-vera-caption text-vera-text-tertiary">
                {t(`meetingFlow.role.${role}.description`)}
              </span>
              <ul className="flex flex-col gap-1">
                {capabilities.map((capability) => {
                  const isAllowed = roleCapabilities[role][capability];

                  return (
                    <li
                      key={capability}
                      className="flex items-center gap-2 font-vera-plain text-vera-caption text-vera-text-secondary"
                    >
                      <VividIcon
                        name={isAllowed ? 'check-line' : 'close-line'}
                        customSize={-6}
                        style={{ color: isAllowed ? 'var(--vera-success)' : 'var(--vera-error)' }}
                      />
                      {t(`meetingFlow.role.capability.${capability}`)}
                    </li>
                  );
                })}
              </ul>
            </button>
          );
        })}
      </div>
      <Notice tone="information">{t('meetingFlow.wizard.roles.moderatorNote')}</Notice>
    </div>
  );
};

export default RolesCards;
