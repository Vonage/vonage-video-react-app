import VividIcon from '@ui/components/VividIcon';
import useSessionKeyParam from '@hooks/useSessionKeyParam';
import Button from '@mui/material/Button';
import { useMemo, type ReactElement } from 'react';
import { decodeSessionKey, readScheduleClaim } from '@common/helpers';
import { isNil, isNotNil } from '@common/assertions';
import { serverSettings$ } from '@core/stores';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * ReenterRoomButton Component
 *
 * This component returns a button that takes a user back to the meeting.
 * @returns {ReactElement} - the re-enter room button or an empty string if the room does not exist.
 */
const ReenterRoomButton = (): ReactElement | string | null => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sessionKey, sessionKeyStatus } = useSessionKeyParam();
  const scheduleWindow = useMemo(() => {
    if (sessionKeyStatus !== 'valid') return null;

    return readScheduleClaim(decodeSessionKey({ sessionKey }));
  }, [sessionKey, sessionKeyStatus]);
  serverSettings$.useServerSettings({
    sessionKey,
    queryOptions: { enabled: isNotNil(scheduleWindow) },
  });
  const endsAtMs = scheduleWindow?.endsAtMs;
  const shouldShowReenter = serverSettings$.use.select(
    (state) => isNil(endsAtMs) || (state.status === 'known' && state.now < endsAtMs),
    { dependencies: [endsAtMs] }
  );

  const handleReenter = () => {
    void navigate(`/waiting-room/${sessionKey}`);
  };
  if (!shouldShowReenter) return null;

  return (
    sessionKey && (
      <Button
        startIcon={
          <VividIcon
            name="enter-line"
            customSize={-5}
            style={{ color: 'var(--vera-on-primary)' }}
          />
        }
        variant="contained"
        data-testid="reenterButton"
        onClick={handleReenter}
        fullWidth
      >
        {t('goodBye.reEnter')}
      </Button>
    )
  );
};

export default ReenterRoomButton;
