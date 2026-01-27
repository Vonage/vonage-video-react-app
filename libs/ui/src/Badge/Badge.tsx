import { Badge as MUIBadge, BadgeProps as MUIBadgeProps } from '@mui/material';

export type BadgeProps = MUIBadgeProps;

const Badge = (badgeProps: BadgeProps) => {
  return <MUIBadge {...badgeProps} />;
};

export default Badge;
