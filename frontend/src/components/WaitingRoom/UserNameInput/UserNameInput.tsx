import React, { Dispatch, MouseEvent, ReactElement, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TextField from '@ui/TextField';
import Button from '@ui/Button';
import Box from '@ui/Box';
import Typography from '@ui/Typography';
import useCustomTheme from '@Context/Theme/CustomTheme';
import useUserContext from '../../../hooks/useUserContext';
import { UserType } from '../../../Context/user';
import useRoomName from '../../../hooks/useRoomName';
import isValidRoomName from '../../../utils/isValidRoomName';
import { setStorageItem, STORAGE_KEYS } from '../../../utils/storage';

export type UserNameInputProps = {
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
};

/**
 * UsernameInput Component
 *
 * Handles setting the username and navigating to the meeting room.
 * @param {UserNameInputProps} props - The props for the component.
 *  @property {string} username - The user's name
 *  @property {Dispatch<SetStateAction<string>>} setUsername - Function to update the user's username.
 * @returns {ReactElement} The UsernameInput component.
 */
const UsernameInput = ({ username, setUsername }: UserNameInputProps): ReactElement => {
  const { t } = useTranslation();
  const { setUser } = useUserContext();
  const navigate = useNavigate();
  const roomName = useRoomName();
  const [isUserNameInvalid, setIsUserNameInvalid] = useState(false);
  const theme = useCustomTheme();

  const onChangeParticipantName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUserName = e.target.value;
    if (inputUserName === '' || inputUserName.trim() === '') {
      // Space detected
      setUsername('');
      return;
    }
    setIsUserNameInvalid(false);
    setUsername(inputUserName);
  };

  const validateForm = () => {
    if (username === '') {
      setIsUserNameInvalid(true);
      return false;
    }
    return true;
  };

  const handleJoinClick = (event: MouseEvent) => {
    event.preventDefault();
    if (validateForm() && roomName) {
      if (!isValidRoomName(roomName)) {
        return;
      }
      setUser((prevUser: UserType) => ({
        ...prevUser,
        defaultSettings: {
          ...prevUser.defaultSettings,
          name: username,
        },
      }));
      setStorageItem(STORAGE_KEYS.USERNAME, username);
      // This takes the user to the meeting room and allows them to enter it
      // Otherwise if they entered the room directly, they are going to be redirected back to the waiting room
      // Setting hasAccess is required so that we are not redirected back to the waiting room
      navigate(`/room/${roomName}`, {
        state: {
          hasAccess: true,
        },
      });
    }
  };

  return (
    <Box
      component="form"
      sx={{
        maxWidth: { xs: '100%', md: '500px' },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        bgcolor: 'background.paper',
        padding: { xs: '0px 0px 0px 0px', md: '40px' },
        borderRadius: theme.shapes.borderRadiusMedium,
      }}
    >
      <Typography>{t('waitingRoom.user.input.title')}</Typography>
      <Box
        sx={{
          width: '100%',
          mt: 2,
          mb: 5,
        }}
      >
        <TextField
          size="small"
          label={t('waitingRoom.user.input.label')}
          onChange={onChangeParticipantName}
          required
          id="user-name"
          name="Name"
          error={isUserNameInvalid}
          autoComplete="Name"
          autoFocus
          value={username}
          inputProps={{ maxLength: 60 }}
        />
      </Box>

      <Typography sx={{ mb: 2 }}>{t('waitingRoom.title')}</Typography>

      <Box>
        <Typography sx={{ mb: 2 }} noWrap>
          {roomName}
        </Typography>
      </Box>
      <Button
        onClick={handleJoinClick}
        variant="contained"
        color="primary"
        disabled={!username}
        type="submit"
        fullWidth
      >
        {t('button.join')}
      </Button>
    </Box>
  );
};

export default UsernameInput;
