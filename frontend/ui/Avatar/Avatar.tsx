import { Avatar as MUIAvatar, AvatarProps as MUIAvatarProps } from '@mui/material';

type AvatarProps = MUIAvatarProps;

const Avatar = (avatarProps: AvatarProps) => {
  return <MUIAvatar {...avatarProps} />;
};

export default Avatar;
