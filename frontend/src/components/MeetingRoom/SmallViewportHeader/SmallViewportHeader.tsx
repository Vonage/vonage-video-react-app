import { ReactElement, useState } from 'react';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import { ContentCopy } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import Box from '@ui/Box';
import useCustomTheme from '@Context/Theme';
import useSessionContext from '../../../hooks/useSessionContext';
import useRoomName from '../../../hooks/useRoomName';
import useRoomShareUrl from '../../../hooks/useRoomShareUrl';
import IconButton from '@ui/IconButton';
import Fade from '@ui/Fade';

/**
 * SmallViewportHeader Component
 *
 * This component shows a header bar in smaller viewport devices that consists of recording on/off indicator,
 * meeting room name, and copy-to-clipboard button.
 * @returns {ReactElement} The small viewport header component.
 */
const SmallViewportHeader = (): ReactElement => {
  const theme = useCustomTheme();
  const { archiveId } = useSessionContext();
  const isRecording = !!archiveId;
  const roomName = useRoomName();
  const roomShareUrl = useRoomShareUrl();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const copyUrl = () => {
    navigator.clipboard.writeText(roomShareUrl);

    setIsCopied(true);

    // reset the icon back after a brief timeout
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };
  return (
    <Box
      data-testid="smallViewportHeader"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.darkBackground,
        paddingX: 2,
        paddingTop: 2,
        color: theme.colors.onDarkGrey,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, paddingX: 0.5 }}>
        {isRecording && (
          <RadioButtonCheckedIcon sx={{ color: theme.colors.error }} />
        )}
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {roomName}
        </Box>
      </Box>
      <Box sx={{ marginX: -1 }}>
        <Fade in timeout={500}>
          <IconButton
            sx={{ color: theme.colors.onDarkGrey }}
            onClick={copyUrl}
            disabled={isCopied}
          >
            {isCopied ? (
              <CheckIcon sx={{ color: theme.colors.success }} />
            ) : (
              <ContentCopy sx={{ color: theme.colors.onDarkGrey }} />
            )}
          </IconButton>
        </Fade>
      </Box>
    </Box>
  );
};

export default SmallViewportHeader;
