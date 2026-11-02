import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import VividIcon from '@ui/components/VividIcon';
import SelectionCheckbox from '../../../components/SelectionCheckbox';
import roleCapabilities, { type RoleCapability } from '../../../constants/roleCapabilities';
import roleIconName from '../../../constants/roleIconName';
import type { MeetingRole } from '../../../types/MeetingRole';
import createRoomWizard$ from '../../context/createRoomWizardContext';
import ExtraRolesCheck from './components/ExtraRolesCheck';

const rows: MeetingRole[] = ['moderator', 'publisher', 'subscriber', 'publisherOnly'];
const capabilities: RoleCapability[] = ['send', 'receive', 'moderate'];

/**
 * Roles variant C: a permission table compares every role side by side; the moderator row is fixed.
 */
const RolesMatrix = (): ReactElement => {
  const { t } = useTranslation();
  const hasExtraRoles = createRoomWizard$.use.select((state) => state.hasExtraRoles);
  const selectedRoles = createRoomWizard$.use.select((state) => state.selectedRoles);
  const { toggleRole } = createRoomWizard$.use.actions();

  return (
    <div className="flex flex-col gap-5">
      <ExtraRolesCheck />
      <div className="overflow-x-auto rounded-vera-large border border-vera-border">
        <table className="w-full border-collapse text-left">
          <thead className="bg-vera-background">
            <tr>
              <th className="px-3 py-2 font-vera-plain text-vera-caption-semibold text-vera-text-tertiary">
                {t('meetingFlow.wizard.roles.matrix.role')}
              </th>
              {capabilities.map((capability) => (
                <th
                  key={capability}
                  className="px-3 py-2 text-center font-vera-plain text-vera-caption-semibold text-vera-text-tertiary"
                >
                  {t(`meetingFlow.role.capability.${capability}`)}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-vera-plain text-vera-caption-semibold text-vera-text-tertiary">
                {t('meetingFlow.wizard.roles.include')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((role) => {
              const isModerator = role === 'moderator';
              const isRowMuted = !isModerator && !hasExtraRoles;

              return (
                <tr
                  key={role}
                  className={classNames('border-t border-vera-border', {
                    'opacity-50': isRowMuted,
                  })}
                >
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2 font-vera-plain text-vera-body-base-semibold text-vera-text-secondary">
                      <VividIcon name={roleIconName[role]} customSize={-5} />
                      {t(`meetingFlow.role.${role}`)}
                    </span>
                  </td>
                  {capabilities.map((capability) => {
                    const isAllowed = roleCapabilities[role][capability];

                    return (
                      <td key={capability} className="px-3 py-3 text-center">
                        <VividIcon
                          name={isAllowed ? 'check-line' : 'close-line'}
                          customSize={-5}
                          aria-label={String(isAllowed)}
                          style={{
                            color: isAllowed ? 'var(--vera-success)' : 'var(--vera-text-disabled)',
                          }}
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center">
                    {isModerator ? (
                      <VividIcon
                        name="lock-line"
                        customSize={-5}
                        aria-label={t('meetingFlow.wizard.roles.moderatorNote')}
                        style={{ color: 'var(--vera-text-tertiary)' }}
                      />
                    ) : (
                      <SelectionCheckbox
                        aria-label={t(`meetingFlow.role.${role}`)}
                        disabled={!hasExtraRoles}
                        checked={hasExtraRoles && selectedRoles.includes(role)}
                        onChange={() => toggleRole(role)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="font-vera-plain text-vera-caption text-vera-text-tertiary">
        {t('meetingFlow.wizard.roles.moderatorNote')}
      </p>
    </div>
  );
};

export default RolesMatrix;
