import { ReactElement, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@ui/Dialog';
import DialogTitle from '@ui/DialogTitle';
import IconButton from '@ui/IconButton';
import DialogContent from '@ui/DialogContent';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import Typography from '@ui/Typography';
import Box from '@ui/Box';
import Button from '@ui/Button';
import CircularProgress from '@ui/CircularProgress';
import useNetworkTest from '@hooks/useNetworkTest';
import useRoomName from '@hooks/useRoomName';
import PrecallNetworkTestQualityRow from './PrecallNetworkTestQualityRow';

export type PrecallNetworkTestDialogProps = {
  isPrecallNetworkTestOpen: boolean;
  setIsPrecallNetworkTestOpen: (open: boolean) => void;
};

/**
 * PrecallNetworkTestDialog Component
 *
 * This component renders a dialog for pre-call network testing in the waiting room.
 * @param {PrecallNetworkTestDialogProps} props - The props for the component.
 *   @property {boolean} isPrecallNetworkTestOpen - Whether the dialog is open.
 *   @property {Function} setIsPrecallNetworkTestOpen - Function to set the open state of the dialog.
 * @returns {ReactElement} The pre-call network test dialog component.
 */
const PrecallNetworkTestDialog = ({
  isPrecallNetworkTestOpen,
  setIsPrecallNetworkTestOpen,
}: PrecallNetworkTestDialogProps): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const roomName = useRoomName();
  const { state, testQuality, stopTest, clearResults } = useNetworkTest();

  const handleClose = useCallback(() => {
    stopTest();
    clearResults();
    setIsPrecallNetworkTestOpen(false);
  }, [stopTest, clearResults, setIsPrecallNetworkTestOpen]);

  const handleStartTest = useCallback(async () => {
    try {
      await testQuality(roomName);
    } catch (error) {
      console.error('Network test failed:', error);
    }
  }, [testQuality, roomName]);

  const handleRetry = useCallback(() => {
    clearResults();
    handleStartTest();
  }, [clearResults, handleStartTest]);

  const handleStopTest = useCallback(() => {
    stopTest();
    clearResults();
    setIsPrecallNetworkTestOpen(false);
  }, [stopTest, clearResults, setIsPrecallNetworkTestOpen]);

  useEffect(() => {
    if (isPrecallNetworkTestOpen) {
      handleStartTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const audioScore = state.qualityResults?.audio?.mos
    ? Math.round(state.qualityResults.audio.mos * 100) / 100
    : null;
  const videoScore = state.qualityResults?.video?.mos
    ? Math.round(state.qualityResults.video.mos * 100) / 100
    : null;

  const isGoodScoreQuality = (score: number | null) => {
    return score !== null && score >= 3;
  };

  const audioSupportTitle = useMemo(() => {
    if (audioScore === null) return undefined;
    return t(
      isGoodScoreQuality(audioScore)
        ? 'waitingRoom.precallNetworkTest.audioSupported'
        : 'waitingRoom.precallNetworkTest.audioNotSupported'
    );
  }, [audioScore, t]);

  const videoSupportTitle = useMemo(() => {
    if (videoScore === null) return undefined;
    return t(
      isGoodScoreQuality(videoScore)
        ? 'waitingRoom.precallNetworkTest.videoSupported'
        : 'waitingRoom.precallNetworkTest.videoNotSupported'
    );
  }, [videoScore, t]);

  return (
    <Dialog open={isPrecallNetworkTestOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 3,
          pb: 1,
          backgroundColor: theme.colors.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          component="span"
          variant="h5"
          sx={{
            fontWeight: theme.typography.weight['body-base'].value,
            color: theme.colors.textSecondary,
          }}
        >
          {t('waitingRoom.precallNetworkTest.title')}
        </Typography>
        <IconButton
          aria-label={t('button.close')}
          onClick={handleClose}
          sx={{
            color: theme.colors.secondary,
          }}
        >
          <VividIcon name="close-line" customSize={-5} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: theme.colors.surface }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography
            variant="body1"
            sx={{
              color: theme.colors.textSecondary,
              fontWeight: theme.typography.weight['body-base'].value,
              textAlign: 'left',
            }}
          >
            {t('waitingRoom.precallNetworkTest.subtitle')}
          </Typography>

          {state.isTestingQuality && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mt: 4,
                }}
              >
                <CircularProgress size={60} />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  p: 2,
                  justifyContent: 'end',
                }}
              >
                <Button
                  variant="text"
                  onClick={handleClose}
                  sx={{
                    mr: 1,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {t('button.close')}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleStopTest}
                  sx={{
                    color: theme.colors.onPrimary,
                    ml: 2,
                  }}
                >
                  {t('waitingRoom.precallNetworkTest.stopTest')}
                </Button>
              </Box>
            </Box>
          )}

          {!state.isTestingQuality && (state.qualityResults || state.error) && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {state.error ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    py: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.colors.error,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <VividIcon
                      name="close-circle-line"
                      customSize={0}
                      sx={{
                        color: theme.colors.error,
                      }}
                    />
                    {t('waitingRoom.precallNetworkTest.error')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.colors.textSecondary, textAlign: 'center' }}
                  >
                    {state.error.message}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
                  <PrecallNetworkTestQualityRow
                    label={t('waitingRoom.precallNetworkTest.audio')}
                    score={audioScore}
                    supportTitle={audioSupportTitle}
                  />
                  <PrecallNetworkTestQualityRow
                    label={t('waitingRoom.precallNetworkTest.video')}
                    score={videoScore}
                    supportTitle={videoSupportTitle}
                  />
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  p: 2,
                  justifyContent: 'end',
                }}
              >
                <Button
                  variant="text"
                  onClick={handleClose}
                  sx={{
                    mr: 1,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {t('button.close')}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRetry}
                  sx={{
                    color: theme.colors.onPrimary,
                    ml: 2,
                  }}
                >
                  {t('waitingRoom.precallNetworkTest.retryTest')}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PrecallNetworkTestDialog;
