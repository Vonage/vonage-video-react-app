import React, { Dispatch, MouseEvent, ReactElement, SetStateAction, useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@ui/components/Card';
import useUserContext from '@hooks/useUserContext';
import { UserType } from '@Context/user';
import isValidUserName from '@utils/isValidUserName';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import Separator from '@components/Separator';
import { CardProps } from '@mui/material';
import { twMerge } from 'tailwind-merge';
import { isNil } from '@common/assertions';
import type { ScheduleWindow } from '@common/types';
import ScheduleCountdownPanel from './components/ScheduleCountdownPanel';
import ScheduleCountdownPanelSkeleton from './components/ScheduleCountdownPanel/ScheduleCountdownPanel.skeleton';
import JoinBlockerText from './components/JoinBlockerText';
import useScheduleStatus from './hooks/useScheduleStatus';
import useScheduleTabTitle from './hooks/useScheduleTabTitle';

export type UserNameInputProps = Omit<CardProps, 'sx'> & {
  username: string;
  roomName: string | undefined;
  sessionKey: string;
  scheduleWindow: ScheduleWindow | null;
  setUsername: Dispatch<SetStateAction<string>>;
};

const joinBlockerTextId = 'join-blocker-text';

/**
 * UsernameInput Component
 *
 * Handles setting the username and navigating to the meeting room.
 * @param {UserNameInputProps} props - The props for the component.
 *  @property {string} username - The user's name
 *  @property {Dispatch<SetStateAction<string>>} setUsername - Function to update the user's username.
 *  @property {ReactNode} children - Rendered in place of the Join button once a scheduled meeting has ended.
 * @returns {ReactElement} The UsernameInput component.
 */
const UsernameInput = ({
  roomName,
  sessionKey,
  scheduleWindow,
  username,
  setUsername,
  className,
  children,
  ...cardProps
}: UserNameInputProps): ReactElement => {
  const { t } = useTranslation();
  const { setUser } = useUserContext();
  const navigate = useNavigate();

  const [isUserNameInvalid, setIsUserNameInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const scheduleStatus = useScheduleStatus({ sessionKey, scheduleWindow });

  useScheduleTabTitle({ scheduleStatus, meetingName: roomName });

  const isScheduled = scheduleStatus.kind !== 'unscheduled';
  const isEnded = scheduleStatus.kind === 'ended';
  const isPending = scheduleStatus.kind === 'pending';
  const isJoinEnabled = scheduleStatus.kind === 'unscheduled' || scheduleStatus.kind === 'started';
  const isWaiting = scheduleStatus.kind !== 'ended' && !isPending && !isJoinEnabled;

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
    if (validateForm() && sessionKey) {
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
      void navigate(`/room/${sessionKey}`, {
        state: {
          hasAccess: true,
        },
      });
    }
  };

  return (
    <Card
      component="form"
      onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
      className={twMerge('flex flex-col gap-4 text-left lg:max-w-125', className)}
      {...cardProps}
    >
      <div className="flex w-full flex-col gap-1">
        <p className="font-vera-plain text-vera-caption-semibold uppercase text-vera-text-tertiary">
          {t('waitingRoom.title')}
        </p>

        {!isNil(roomName) && (
          <h2 className="font-vera-plain text-vera-heading-2 text-vera-text-secondary break-words">
            {roomName}
          </h2>
        )}
      </div>

      <Separator width="100%" />

      {isPending && (
        <>
          <ScheduleCountdownPanelSkeleton />
          <Separator width="100%" />
        </>
      )}

      {isScheduled && !isPending && (
        <>
          <ScheduleCountdownPanel scheduleStatus={scheduleStatus} />
          <Separator width="100%" />
        </>
      )}

      <Box className="flex w-full flex-col gap-2">
        <label
          htmlFor="user-name"
          className="font-vera-plain text-vera-caption-semibold text-vera-text-tertiary"
        >
          {t('waitingRoom.user.input.title')}
        </label>
        <TextField
          fullWidth
          size="small"
          onChange={onChangeParticipantName}
          onClick={handleInputFocus}
          required
          id="user-name"
          name="username"
          error={isUserNameInvalid}
          disabled={isEnded}
          helperText={isUserNameInvalid ? t('waitingRoom.user.input.error') : ''}
          autoComplete="nickname"
          autoFocus
          value={username}
          slotProps={{
            htmlInput: {
              maxLength: 60,
              className: 'disabled:[-webkit-text-fill-color:var(--vera-text-disabled)]',
            },
            input: {
              className:
                '[&.Mui-disabled_.MuiOutlinedInput-notchedOutline]:border-vera-text-disabled!',
            },
          }}
          inputRef={inputRef}
        />
      </Box>

      {isEnded && children}

      {!isEnded && (
        <Button
          onClick={handleJoinClick}
          variant="contained"
          color="primary"
          type="submit"
          fullWidth
          disabled={!isJoinEnabled}
          aria-describedby={isWaiting ? joinBlockerTextId : undefined}
          className="disabled:bg-vera-disabled! disabled:text-vera-text-disabled! disabled:border-vera-disabled!"
        >
          {t('button.join')}
        </Button>
      )}

      {isWaiting && <JoinBlockerText id={joinBlockerTextId} waitingStatus={scheduleStatus} />}
    </Card>
  );
};

export default UsernameInput;
