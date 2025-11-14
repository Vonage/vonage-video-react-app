import { Badge as MUIBadge, BadgeProps as MUIBadgeProps } from '@mui/material';

type BadgeProps = MUIBadgeProps;

const Badge = (badgeProps: BadgeProps) => {
  return <MUIBadge {...badgeProps} />;
};

export default Badge;
