import React, { Dispatch, MouseEvent, ReactElement, SetStateAction, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@ui/Card';
import useUserContext from '@hooks/useUserContext';
import { UserType } from '@Context/user';
import isValidUserName from '@utils/isValidUserName';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import Separator from '@components/Separator';
import { CardProps } from '@mui/material';
import { twMerge } from 'tailwind-merge';
import { isValidRoomName } from '@common/assertions';

export type UserNameInputProps = Omit<CardProps, 'sx'> & {
  username: string;
  roomName: string;
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
const UsernameInput = ({
  roomName,
  username,
  setUsername,
  className,
  ...cardProps
}: UserNameInputProps): ReactElement => {
  const { t } = useTranslation();
  const { setUser } = useUserContext();
  const navigate = useNavigate();

  const [isUserNameInvalid, setIsUserNameInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChangeParticipantName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUserName = e.target.value;
    setIsUserNameInvalid(false);
    setUsername(inputUserName);
  };

  const handleInputFocus = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const validateForm = () => {
    if (!isValidUserName(username)) {
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
    <Card
      component="form"
      className={twMerge('flex flex-col gap-4 lg:max-w-125', className)}
      {...cardProps}
    >
      <Typography className="text-vera-secondary text-vera-heading-4!">
        {t('waitingRoom.user.input.title')}
      </Typography>

      <Box className="w-full">
        <TextField
          fullWidth
          size="small"
          label={t('waitingRoom.user.input.label')}
          onChange={onChangeParticipantName}
          onClick={handleInputFocus}
          required
          id="user-name"
          name="username"
          error={isUserNameInvalid}
          helperText={isUserNameInvalid ? t('waitingRoom.user.input.error') : ''}
          autoComplete="nickname"
          autoFocus
          value={username}
          slotProps={{
            htmlInput: { maxLength: 60 },
            inputLabel: { required: false },
          }}
          inputRef={inputRef}
        />
      </Box>

      <Separator width="100%" />

      <Typography className={'text-vera-secondary text-vera-heading-4!'}>
        {t('waitingRoom.title')}
      </Typography>

      <Typography className="text-vera-tertiary text-vera-heading-4!" noWrap>
        {roomName}
      </Typography>

      <Button onClick={handleJoinClick} variant="contained" color="primary" type="submit" fullWidth>
        {t('button.join')}
      </Button>
    </Card>
  );
};

export default UsernameInput;
