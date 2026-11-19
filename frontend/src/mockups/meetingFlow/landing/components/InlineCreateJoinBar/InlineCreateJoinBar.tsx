import { useState, type ComponentProps, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { twMerge } from 'tailwind-merge';
import VividIcon from '@ui/components/VividIcon';

export type InlineCreateJoinBarProps = ComponentProps<'div'>;

/**
 * One-line "create or join" bar, in the spirit of Google Meet's landing page.
 */
const InlineCreateJoinBar = ({ className, ...props }: InlineCreateJoinBarProps): ReactElement => {
  const { t } = useTranslation();
  const [roomId, setRoomId] = useState('');
  const hasRoomId = roomId.trim() !== '';

  return (
    <div
      className={twMerge('flex w-full flex-col gap-3 sm:flex-row sm:items-center', className)}
      {...props}
    >
      <Button
        variant="contained"
        className="shrink-0"
        startIcon={
          <VividIcon name="plus-line" customSize={-5} style={{ color: 'var(--vera-on-primary)' }} />
        }
      >
        {t('button.createRoom')}
      </Button>
      <div className="flex flex-1 items-center gap-2">
        <TextField
          size="small"
          fullWidth
          id="mockup-inline-room-id"
          label={t('meetingFlow.landing.roomId.label')}
          value={roomId}
          onChange={(event) => setRoomId(event.target.value)}
        />
        <Button
          variant="text"
          disabled={!hasRoomId}
          className="shrink-0 disabled:text-vera-text-disabled!"
        >
          {t('meetingFlow.common.join')}
        </Button>
      </div>
    </div>
  );
};

export default InlineCreateJoinBar;
