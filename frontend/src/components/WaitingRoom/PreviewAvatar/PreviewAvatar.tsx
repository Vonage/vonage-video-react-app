import { Avatar, AvatarProps } from '@mui/material';
import { ReactElement } from 'react';
import useWindowWidth from '../../../hooks/useWindowWidth';
import AvatarInitials from '../../AvatarInitials';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type PreviewAvatarProps = AvatarProps & {
  username: string;
  initials: string;
};

/**
 * PreviewAvatar Component
 *
 * Displays the user's initials if initials are available, an empty avatar if initials are unavailable, or nothing if the user is publishing video or the publisher is initializing.
 * @param {PreviewAvatarProps} props - The props for the component.
 *  @property {string} username - The user's username.
 *  @property {string} initials - The user's initials.
 *  @property {boolean} isVideoEnabled - Whether the user is publishing video.
 *  @property {boolean} isVideoLoading - Whether the preview publisher is initialized.
 * @returns {ReactElement | null} - The PreviewAvatar component or `null`.
 */
const PreviewAvatar = ({
  initials,
  username,
  ...props
}: PreviewAvatarProps): ReactElement | null => {
  const smallDisplayDimensions = useWindowWidth() * 0.46;
  const isSmallViewport = useIsSmallViewport();
  const height = isSmallViewport ? smallDisplayDimensions : 328;
  const width = isSmallViewport ? smallDisplayDimensions : 584;

  return initials ? (
    <AvatarInitials
      initials={initials}
      sx={{
        position: 'absolute',
      }}
      username={username}
      height={height}
      width={width}
      {...props}
    />
  ) : (
    <Avatar
      sx={{
        bgcolor: '#4caf50',
        position: 'absolute',
        margin: 'auto',
        width: '174px',
        height: '174px',
        fontSize: '58pt',
      }}
      {...props}
    />
  );
};

export default PreviewAvatar;
