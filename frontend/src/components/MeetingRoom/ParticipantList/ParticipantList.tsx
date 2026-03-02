import { ReactElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSessionContext from '@hooks/useSessionContext';
import useUserContext from '@hooks/useUserContext';
import useAudioLevels from '@hooks/useAudioLevels';
import ParticipantListItem from '../ParticipantListItem';
import getInitials from '@utils/getInitials';
import getParticipantColor from '@utils/getParticipantColor';
import useRoomShareUrl from '@hooks/useRoomShareUrl';
import RightPanelTitle from '../RightPanel/RightPanelTitle';
import usePublisherContext from '@hooks/usePublisherContext';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@ui/theme';
import Stack from '@mui/material/Stack';
import VividIcon from '@components/VividIcon';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import createNameMatcher from '@utils/participantList/createNameMatcher';
import getFilteredSubscribers from '@utils/participantList/getFilteredSubscribers';
import shouldShowUser from '@utils/participantList/shouldShowUser';

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
  const { t } = useTranslation();
  const theme = useTheme();
  const { subscriberWrappers } = useSessionContext();
  const publisherAudio = useAudioLevels();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const {
    user: {
      defaultSettings: { name },
    },
  } = useUserContext();
  const roomShareUrl = useRoomShareUrl();
  const { isAudioEnabled } = usePublisherContext();

  const { filteredSubscriberWrappers, isUserVisible, participantCount } = useMemo(() => {
    const nameMatches = createNameMatcher(query);
    const filteredSubscriberWrappersLocal = getFilteredSubscribers({
      subscriberWrappers,
      nameMatches,
    });
    const isUserVisibleLocal = shouldShowUser(nameMatches, name);
    const participantCountLocal =
      (isUserVisibleLocal ? 1 : 0) + filteredSubscriberWrappersLocal.length;

    return {
      nameMatches,
      filteredSubscriberWrappers: filteredSubscriberWrappersLocal,
      isUserVisible: isUserVisibleLocal,
      participantCount: participantCountLocal,
    };
  }, [subscriberWrappers, query, name]);

  const copyUrl = () => {
    void navigator.clipboard.writeText(roomShareUrl);

    setIsCopied(true);

    // reset the icon back after a brief timeout
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };
  return (
    isOpen && (
      <>
        <RightPanelTitle
          title={`${t('participants.title')} (${participantCount})`}
          handleClose={handleClose}
        />
        <Box
          sx={{
            display: 'flex',
            height: '64px',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            pl: 3,
          }}
        >
          <Stack sx={{ textAlign: 'left', color: theme.colors.textSecondary }}>
            <Typography variant="subtitle2">{t('chat.meetingUrl')}</Typography>
            <Typography
              variant="body2"
              title={window.location.href}
              sx={{
                display: 'block',
                maxWidth: '16rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {window.location.href}
            </Typography>
          </Stack>
          <IconButton
            size="large"
            sx={{ color: theme.colors.tertiary, mr: 0.75 }}
            onClick={copyUrl}
            disabled={isCopied}
          >
            <Tooltip
              arrow
              title={isCopied ? t('chat.copied') : t('chat.copy')}
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 500 }}
            >
              {isCopied ? (
                <VividIcon
                  name="check-sent-line"
                  customSize={-4}
                  sx={{ color: theme.colors.success }}
                />
              ) : (
                <VividIcon name="copy-line" customSize={-4} />
              )}
            </Tooltip>
          </IconButton>
        </Box>
        <Box sx={{ px: 3, pt: 1, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('participants.search') || 'Search participants'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VividIcon name="search-line" customSize={-6} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <List sx={{ overflowX: 'auto', height: 'calc(100dvh - 296px)' }}>
          {isUserVisible && (
            <ParticipantListItem
              key="you"
              dataTestId="participant-list-item-you"
              hasAudio={isAudioEnabled}
              audioLevel={isAudioEnabled ? publisherAudio : undefined}
              name={`${name} (${t('user.you')})`}
              initials={getInitials(name)}
              avatarColor={getParticipantColor(name)}
            />
          )}
          {filteredSubscriberWrappers.map((subscriberWrapper) => {
            const { subscriber, id } = subscriberWrapper;
            const hasAudio = !!subscriber.stream?.hasAudio;
            const participantName: string = subscriber?.stream?.name ?? '';
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
