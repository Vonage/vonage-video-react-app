import { Fade, IconButton, List, Tooltip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import { ReactElement, useState } from 'react';
import useSessionContext from '../../../hooks/useSessionContext';
import useUserContext from '../../../hooks/useUserContext';
import useAudioLevels from '../../../hooks/useAudioLevels';
import ParticipantListItem from '../ParticipantListItem';
import getInitials from '../../../utils/getInitials';
import { SubscriberWrapper } from '../../../types/session';
import getParticipantColor from '../../../utils/getParticipantColor';
import useRoomShareUrl from '../../../hooks/useRoomShareUrl';
import RightPanelTitle from '../RightPanel/RightPanelTitle';

const compareNameAlphabetically = (a: SubscriberWrapper, b: SubscriberWrapper) => {
  const nameA = a.subscriber?.stream?.name;
  const nameB = b.subscriber?.stream?.name;
  if (!nameA) {
    return 1;
  }
  if (!nameB) {
    return -1;
  }
  return nameA.localeCompare(nameB);
};

export type ParticipantListProps = {
  handleClose: () => void;
  isOpen: boolean;
};

/**
 * ParticipantList Component
 *
 * This component shows a list of the participants that are currently in the meeting room.
 * It also has a meeting URL link that can be copied to the clipboard.
 * @param {ParticipantListProps} props - the props for the component.
 *  @property {Function} handleClose - a function that handles closing of the participant list.
 *  @property {boolean} isOpen - a variable that shows whether the participant list should be displayed.
 * @returns {ReactElement} The participant list component.
 */
const ParticipantList = ({ handleClose, isOpen }: ParticipantListProps): ReactElement | false => {
  const { subscriberWrappers } = useSessionContext();
  const publisherAudio = useAudioLevels();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const {
    user: {
      defaultSettings: { name },
    },
  } = useUserContext();
  const roomShareUrl = useRoomShareUrl();
  const copyUrl = () => {
    navigator.clipboard.writeText(roomShareUrl);

    setIsCopied(true);

    // reset the icon back after a brief timeout
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };
  return (
    isOpen && (
      <>
        <RightPanelTitle title="Participants" handleClose={handleClose} />
        <div className="flex h-[64px] flex-row items-center justify-between pl-6">
          <div className="text-left">
            <span className="text-darkGray text-sm font-bold tracking-normal">Meeting URL:</span>{' '}
            <br />
            <span className="text-darkGray block	max-w-64 truncate text-sm font-normal tracking-normal">
              {window.location.href}
            </span>
          </div>
          <IconButton
            size="large"
            sx={{ color: 'rgb(95, 99, 104)' }}
            onClick={copyUrl}
            disabled={isCopied}
          >
            <Tooltip
              title={isCopied ? 'Copied' : 'Copy to clipboard'}
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
            >
              {isCopied ? <CheckIcon sx={{ color: 'rgba(26,115,232,.9)' }} /> : <ContentCopy />}
            </Tooltip>
          </IconButton>
        </div>
        <List sx={{ overflowX: 'auto', height: 'calc(100vh - 240px)' }}>
          <ParticipantListItem
            key="you"
            dataTestId="participant-list-item-you"
            audioLevel={publisherAudio}
            name={`${name} (You)`}
            initials={getInitials(name)}
            avatarColor={getParticipantColor(name)}
          />
          {subscriberWrappers
            .filter(({ isScreenshare }) => !isScreenshare)
            .sort(compareNameAlphabetically)
            .map((subscriberWrapper) => {
              const { subscriber, id } = subscriberWrapper;
              const hasAudio = !!subscriber.stream?.hasAudio;
              const participantName = subscriber?.stream?.name ?? '';
              const participantStream = subscriber?.stream;
              return (
                <ParticipantListItem
                  key={id}
                  dataTestId={`participant-list-item-${id}`}
                  hasAudio={hasAudio}
                  stream={participantStream}
                  name={participantName}
                  initials={getInitials(participantName)}
                  avatarColor={getParticipantColor(participantName)}
                  subscriberWrapper={subscriberWrapper}
                />
              );
            })}
        </List>
      </>
    )
  );
};

export default ParticipantList;
