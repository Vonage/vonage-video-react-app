import { Avatar, ListItem, Typography } from '@mui/material';
import { ReactElement } from 'react';
import { Stream } from '@vonage/client-sdk-video';
import AudioIndicator from '../AudioIndicator';
import ParticipantListItemMenu from '../ParticipantListItemMenu';
import { SubscriberWrapper } from '../../../types/session';

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
  return (
    <ListItem
      sx={{ height: '56px', paddingRight: '68px' }}
      data-testid={dataTestId}
      secondaryAction={
        <div className="flex items-center justify-center">
          <AudioIndicator
            audioLevel={audioLevel}
            hasAudio={hasAudio}
            stream={stream}
            participantName={name}
            indicatorColor="black"
            indicatorStyle="flex items-center justify-center"
          />
          {subscriberWrapper && (
            <ParticipantListItemMenu participantName={name} subscriberWrapper={subscriberWrapper} />
          )}
        </div>
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
      <Typography
        data-testid="participant-list-name"
        variant="inherit"
        noWrap
        sx={{ marginLeft: '12px' }}
      >
        {name}
      </Typography>
    </ListItem>
  );
};

export default ParticipantListItem;
