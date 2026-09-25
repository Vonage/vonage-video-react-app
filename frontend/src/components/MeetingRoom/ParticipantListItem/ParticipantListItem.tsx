import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Stream } from '@vonage/client-sdk-video';
import AudioIndicator from '../AudioIndicator';
import ParticipantListItemMenu from '../ParticipantListItemMenu';
import { SubscriberWrapper } from '../../../types/session';
import { raiseHand$ } from '@core/stores';
import { env } from '../../../env';
import ListItem from '@mui/material/ListItem';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import VividIcon from '@ui/components/VividIcon';
import Box from '@mui/material/Box';

export type ParticipantListItemProps = {
  stream?: Stream;
  connectionId?: string;
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
 *  @property {string} [connectionId] - participant's connection ID (falls back to the stream's connection)
 *  @property {string} name - participant name
 *  @property {string} dataTestId - ID for testing
 * @returns {ReactElement} ParticipantListItem
 */
const ParticipantListItem = ({
  audioLevel,
  avatarColor,
  connectionId,
  dataTestId,
  hasAudio,
  initials,
  name,
  stream,
  subscriberWrapper,
}: ParticipantListItemProps): ReactElement => {
  const participantConnectionId = connectionId ?? stream?.connection?.connectionId ?? '';
  const raisedHandPosition = raiseHand$.useRaisedHandPosition(participantConnectionId);
  const isHandRaised = env.ALLOW_RAISE_HAND && raisedHandPosition > 0;
  const { t } = useTranslation();

  return (
    <ListItem
      sx={{ height: '56px', paddingRight: '68px' }}
      data-testid={dataTestId}
      secondaryAction={
        <Box
          className="text-vera-secondary"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isHandRaised && (
            <Box
              className="flex items-center gap-1 pr-1 text-vera-accent"
              aria-label={t('raiseHand.handRaisedPosition', { position: raisedHandPosition })}
              data-testid="participant-list-item-raised-hand"
            >
              <VividIcon name="hand-solid" customSize={-4} className="text-vera-accent" />
              <Typography variant="body2" component="span" className="text-vera-accent">
                ({raisedHandPosition})
              </Typography>
            </Box>
          )}
          <AudioIndicator
            audioLevel={audioLevel}
            hasAudio={hasAudio}
            stream={stream}
            participantName={name}
            indicatorColor="var(--vera-secondary)"
            indicatorStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
          {subscriberWrapper && (
            <ParticipantListItemMenu participantName={name} subscriberWrapper={subscriberWrapper} />
          )}
        </Box>
      }
    >
      <Badge
        className="[&_.MuiBadge-badge]:bg-vera-background"
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        invisible={!subscriberWrapper?.isPinned}
        badgeContent={
          <VividIcon
            customSize={-6}
            name="pin-2-solid"
            style={{
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
