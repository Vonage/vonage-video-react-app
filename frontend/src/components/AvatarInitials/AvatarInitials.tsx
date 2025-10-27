import { Avatar, SxProps, AvatarProps } from '@mui/material';
import { ReactElement } from 'react';
import getParticipantColor from '../../utils/getParticipantColor';

export type InitialsProps = AvatarProps & {
  initials?: string;
  username?: string;
  sx?: SxProps;
  height?: number;
  width?: number;
};

/**
 * AvatarInitials Component
 *
 * This component returns the avatar for the given initials
 * @param {InitialsProps} props - the props for the component.
 *  @property {string} initials - (optional) the initials for which the avatar is generated.
 *  @property {string} username - (optional) the username is used to determine the avatar color.
 *  @property {SxProps} sx - the styling properties of the parent component.
 *  @property {number} height - (optional) the height of the avatar.
 *  @property {number} width - (optional) the width of the avatar.
 * @returns {ReactElement} The avatar initials component.
 */
const AvatarInitials = ({
  initials = '',
  username = '',
  sx = {},
  height = 80,
  width = 80,
  ...props
}: InitialsProps): ReactElement => {
  const diameter = Math.min(height, width) * 0.53;

  return (
    <Avatar
      sx={{
        bgcolor: getParticipantColor(username),
        width: `${diameter}px`,
        height: `${diameter}px`,
        fontSize: `${diameter / 3}pt`,
        position: 'absolute',
        margin: 'auto',
        ...sx,
      }}
      {...props}
    >
      {initials}
    </Avatar>
  );
};

export default AvatarInitials;
