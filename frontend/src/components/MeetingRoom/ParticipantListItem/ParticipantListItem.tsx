import { ReactElement } from 'react';
import { Stream } from '@vonage/client-sdk-video';
import AudioIndicator from '../AudioIndicator';
import ParticipantListItemMenu from '../ParticipantListItemMenu';
import { SubscriberWrapper } from '../../../types/session';
import ListItem from '@mui/material/ListItem';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import Box from '@mui/material/Box';

export type ParticipantListItemProps = {
  stream?: Stream;
  initials: string;
  hasAudio?: boolean;
  audioLevel?: number;
  name: string;
  dataTestId: string;
  avatarColor: string;
  subscriberWrapper?: SubscriberWrapper;
};

/**
 * ParticipantListItem component
 * List Item displaying a participant's Avatar, name, and audio enabled icon for the Participant List
 * @param {ParticipantListItemProps} props - the props for this component
 *  @property {number} [audioLevel] - participants audio level
 *  @property {string} avatarColor - color for initials avatar
 *  @property {string} initials - participant initials
 *  @property {boolean} hasAudio - participant's audio enabled status
 *  @property {Stream} stream - participant's stream
 *  @property {string} name - participant name
 *  @property {string} dataTestId - ID for testing
 * @returns {ReactElement} ParticipantListItem
 */
const ParticipantListItem = ({
  audioLevel,
  avatarColor,
  dataTestId,
  hasAudio,
  initials,
  name,
  stream,
  subscriberWrapper,
}: ParticipantListItemProps): ReactElement => {
  const theme = useTheme();

  return (
    <ListItem
      sx={{ height: '56px', paddingRight: '68px' }}
      data-testid={dataTestId}
      secondaryAction={
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AudioIndicator
            audioLevel={audioLevel}
            hasAudio={hasAudio}
            stream={stream}
            participantName={name}
            indicatorColor={theme.colors.secondary}
            indicatorStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
          {subscriberWrapper && (
            <ParticipantListItemMenu participantName={name} subscriberWrapper={subscriberWrapper} />
          )}
        </Box>
      }
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '.MuiBadge-badge': {
            backgroundColor: theme.colors.background,
          },
        }}
        invisible={!subscriberWrapper?.isPinned}
        badgeContent={
          <VividIcon
            customSize={-6}
            name="pin-2-solid"
            sx={{
              position: 'fixed',
            }}
          />
        }
      >
        <Avatar
          sx={{
            bgcolor: avatarColor,
            width: '32px',
            height: '32px',
            fontSize: '14px',
          }}
        >
          {initials}
        </Avatar>
      </Badge>
      <Typography
        data-testid="participant-list-name"
        variant="body1"
        noWrap
        sx={{ marginLeft: '12px' }}
      >
        {name}
      </Typography>
    </ListItem>
  );
};

export default ParticipantListItem;
