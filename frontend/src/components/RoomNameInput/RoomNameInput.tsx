import { SetStateAction, Dispatch, ReactElement, ChangeEvent } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import { Keyboard } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import isValidRoomName from '../../utils/isValidRoomName';

export type RoomNameInputProps = {
  setRoomName: Dispatch<SetStateAction<string>>;
  roomName: string;
  hasError: boolean;
  setHasError: Dispatch<SetStateAction<boolean>>;
};

/**
 * RoomNameInput Component
 *
 * Input box for setting a custom room name.
 * @param {RoomNameInputProps} props - The props for the component.
 *  @property {Dispatch<SetStateAction<string>>} setRoomName - Function to update the room name.
 *  @property {string} roomName - The room name set by the user.
 *  @property {boolean} hasError - The error state indicating whether user added an input with an error.
 *  @property {Dispatch<SetStateAction<boolean>>} setHasError - Function to update the error state.
 * @returns {ReactElement} - The RoomNameInput component.
 */
const RoomNameInput = ({
  setRoomName,
  roomName,
  hasError,
  setHasError,
}: RoomNameInputProps): ReactElement => {
  const { t } = useTranslation();
  const handleChange = (textChangeEvent: ChangeEvent<HTMLInputElement>) => {
    const newValue = textChangeEvent.target.value.toLowerCase();

    if (newValue === '') {
      // If the input is empty, reset the room name and clear the error
      setRoomName('');
      setHasError(false);
      return;
    }

    if (isValidRoomName(newValue)) {
      setHasError(false);
      setRoomName(newValue);
    } else {
      setHasError(true);
    }
  };
  return (
    <TextField
      id="room-name"
      className="h-12 w-52 pr-2"
      placeholder={t('room.input.placeholder')}
      value={roomName}
      onChange={handleChange}
      error={hasError}
      helperText={hasError ? t('room.input.helper') : ''}
      InputProps={{
        inputProps: { maxLength: 60 },
        startAdornment: (
          <InputAdornment position="start">
            <Keyboard />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default RoomNameInput;
