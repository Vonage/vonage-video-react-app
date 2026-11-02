import type { ComponentProps, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { tv } from 'tailwind-variants';
import VividIcon from '@ui/components/VividIcon';
import roleIconName from '../../constants/roleIconName';
import type { MeetingRole } from '../../types/MeetingRole';

export type RoleBadgeProps = ComponentProps<'span'> & {
  meetingRole: MeetingRole;
};

const roleBadge = tv(
  {
    base: 'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-vera-plain text-vera-caption-semibold',
    variants: {
      isModerator: {
        true: 'bg-vera-primary/10 text-vera-text-primary',
        false: 'bg-vera-background text-vera-text-secondary',
      },
    },
  },
  { twMerge: false }
);

/**
 * Small pill naming a role, with its icon.
 */
const RoleBadge = ({ meetingRole, className, ...props }: RoleBadgeProps): ReactElement => {
  const { t } = useTranslation();
  const isModerator = meetingRole === 'moderator';

  return (
    <span className={roleBadge({ isModerator, className })} {...props}>
      <VividIcon
        name={roleIconName[meetingRole]}
        customSize={-6}
        style={{ color: isModerator ? 'var(--vera-text-primary)' : 'var(--vera-text-tertiary)' }}
      />
      {t(`meetingFlow.role.${meetingRole}`)}
    </span>
  );
};

export default RoleBadge;
