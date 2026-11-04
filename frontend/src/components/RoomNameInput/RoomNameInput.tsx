import { SetStateAction, Dispatch, ReactElement, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';

export type RoomNameInputProps = {
  setRoomId: Dispatch<SetStateAction<string>>;
  roomId: string;
  hasError: boolean;
  setHasError: Dispatch<SetStateAction<boolean>>;
};

/**
 * RoomNameInput Component
 *
 * "Room ID" input box that takes a sessionKey or a room name.
 * @param {RoomNameInputProps} props - The props for the component.
 *  @property {Dispatch<SetStateAction<string>>} setRoomId - Function to update the room id.
 *  @property {string} roomId - The room id typed by the user.
 *  @property {boolean} hasError - The error state indicating whether user added an input with an error.
 *  @property {Dispatch<SetStateAction<boolean>>} setHasError - Function to update the error state.
 * @returns {ReactElement} - The RoomNameInput component.
 */
const RoomNameInput = ({
  setRoomId,
  roomId,
  hasError,
  setHasError,
}: RoomNameInputProps): ReactElement => {
  const { t } = useTranslation();

  const handleChange = (textChangeEvent: ChangeEvent<HTMLInputElement>) => {
    setRoomId(textChangeEvent.target.value);
    setHasError(false);
  };

  return (
    <TextField
      size="small"
      id="room-name"
      fullWidth
      label={t('room.input.label')}
      placeholder={t('room.input.hint')}
      value={roomId}
      onChange={handleChange}
      error={hasError}
      helperText={hasError ? t('room.input.helper') : t('room.input.hint')}
    />
  );
};

export default RoomNameInput;
