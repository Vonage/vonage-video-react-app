import {
  AvatarGroup as MUIAvatarGroup,
  AvatarGroupProps as MUIAvatarGroupProps,
} from '@mui/material';

export type AvatarGroupProps = MUIAvatarGroupProps;

const AvatarGroup = (avatarGroupProps: AvatarGroupProps) => {
  return <MUIAvatarGroup {...avatarGroupProps} />;
};

export default AvatarGroup;
