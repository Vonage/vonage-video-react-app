import { TextField, Button, InputAdornment } from '@mui/material';
import React, { Dispatch, MouseEvent, ReactElement, SetStateAction, useState } from 'react';
import { PersonOutline } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserContext from '../../../hooks/useUserContext';
import { UserType } from '../../../Context/user';
import useRoomName from '../../../hooks/useRoomName';
import isValidRoomName from '../../../utils/isValidRoomName';
import { setStorageItem, STORAGE_KEYS } from '../../../utils/storage';

export type UserNameInputProps = {
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
};

declare module '@mui/material/styles' {
  interface Palette {
    blue: Palette['primary'];
  }

  interface PaletteOptions {
    blue?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    blue: {
      main: 'rgba(26,115,232,.9)',
    },
  },
});

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
    <ThemeProvider theme={theme}>
      <form className="flex w-full flex-col justify-center px-6 md:relative md:top-[-48px] md:max-w-[480px]">
        <div className="mt-4 flex flex-col items-center justify-end">
          <div className="mb-2 font-sans text-[28px] leading-8">{t('waitingRoom.title')}</div>
          <div className="flex w-full flex-col content-end py-2 text-lg decoration-solid md:max-w-[480px]">
            <p className="truncate">{roomName}</p>
          </div>
          <div className="mt-6 font-sans text-[24px] leading-8">
            {t('waitingRoom.user.input.label')}
          </div>
          <div className="mb-5 flex w-full flex-wrap items-center justify-center">
            <TextField
              size="small"
              margin="dense"
              placeholder={t('waitingRoom.user.input.placeholder')}
              onChange={onChangeParticipantName}
              sx={{
                display: 'flex',
                width: '100%',
                maxWidth: '212px',
                marginTop: '20px',
                paddingLeft: '0px',
              }}
              required
              id="user-name"
              name="Name"
              error={isUserNameInvalid}
              autoComplete="Name"
              autoFocus
              value={username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline />
                  </InputAdornment>
                ),
                inputProps: { maxLength: 60 },
              }}
            />
          </div>
          <Button
            onClick={handleJoinClick}
            variant="contained"
            color="primary"
            sx={{
              width: '117px',
              borderRadius: '24px',
              color: 'white',
              textTransform: 'none',
              fontSize: '14px',
              height: '48px',
            }}
            disabled={!username}
            type="submit"
          >
            {t('button.join')}
          </Button>
        </div>
      </form>
    </ThemeProvider>
  );
};

export default UsernameInput;
