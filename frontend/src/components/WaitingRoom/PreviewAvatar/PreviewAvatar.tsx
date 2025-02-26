import { Avatar } from '@mui/material';
import { ReactElement } from 'react';
import useWindowWidth from '../../../hooks/useWindowWidth';
import AvatarInitials from '../../AvatarInitials';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type PreviewAvatarProps = {
  username: string;
  initials: string;
  isVideoEnabled: boolean;
  isVideoLoading: boolean;
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
  isVideoEnabled,
  isVideoLoading,
}: PreviewAvatarProps): ReactElement | null => {
  const displayWidth = useWindowWidth() * 0.46;
  const isSmallViewPort = useIsSmallViewport();
  const height = isSmallViewPort ? displayWidth : 328;
  const width = isSmallViewPort ? displayWidth : 584;
  if (isVideoEnabled || isVideoLoading) {
    return null;
  }

  return initials ? (
    <AvatarInitials
      initials={initials}
      sx={{
        position: 'absolute',
        zIndex: isVideoEnabled ? 0 : 1,
      }}
      username={username}
      height={height}
      width={width}
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
    />
  );
};

export default PreviewAvatar;
