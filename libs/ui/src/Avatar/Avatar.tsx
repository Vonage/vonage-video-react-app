import { Avatar as MUIAvatar, AvatarProps as MUIAvatarProps } from '@mui/material';

export type AvatarProps = MUIAvatarProps;

const Avatar = (avatarProps: AvatarProps) => {
  return <MUIAvatar {...avatarProps} />;
};

export default Avatar;
