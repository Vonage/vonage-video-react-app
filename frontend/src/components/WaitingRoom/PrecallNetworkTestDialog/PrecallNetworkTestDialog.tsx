import { ReactElement, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import useRoomName from '@hooks/useRoomName';
import tryCatch from '@common/execution/tryCatch';
import PrecallNetworkTestQualityRow from './PrecallNetworkTestQualityRow';
import DialogActionsRow from './DialogActionsRow';
import useNetworkTest from './hooks/useNetworkTest';

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

  const [hasUserStoppedTest, setHasUserStoppedTest] = useState(false);

  const handleClose = useCallback(() => {
    stopTest();
    clearResults();
    setHasUserStoppedTest(false);
    setIsPrecallNetworkTestOpen(false);
  }, [stopTest, clearResults, setIsPrecallNetworkTestOpen]);

  const handleStopTest = useCallback(() => {
    stopTest();
    clearResults();
    setHasUserStoppedTest(true);
  }, [stopTest, clearResults]);

  const handleStartTest = useCallback(async () => {
    const { error } = await tryCatch(() =>
      testQuality(roomName).onProgress((_, stats) => {
        console.log('Quality test stats update:', stats);
      })
    );

    if (error) {
      console.error('Network test failed:', error);
    }
  }, [testQuality, roomName]);

  const handleRetry = useCallback(() => {
    setHasUserStoppedTest(false);
    clearResults();
    void handleStartTest();
  }, [clearResults, handleStartTest]);

  const getRoundedQualityScore = function getRoundedQualityScore(
    score: number | undefined
  ): number | null {
    if (typeof score !== 'number') return null;
    return Math.round(score * 100) / 100;
  };
  const audioScore = getRoundedQualityScore(state.qualityResults?.audio?.mos);
  const videoScore = getRoundedQualityScore(state.qualityResults?.video?.mos);

  const audioSupportTitle = (() => {
    if (audioScore === null) return undefined;

    const translationKey =
      audioScore >= 3
        ? 'waitingRoom.precallNetworkTest.audioSupported'
        : 'waitingRoom.precallNetworkTest.audioNotSupported';

    return t(translationKey);
  })();

  const videoSupportTitle = (() => {
    if (videoScore === null) return undefined;

    const translationKey =
      videoScore >= 3
        ? 'waitingRoom.precallNetworkTest.videoSupported'
        : 'waitingRoom.precallNetworkTest.videoNotSupported';

    return t(translationKey);
  })();

  const shouldShowTestingState = state.isTestingQuality && !hasUserStoppedTest;
  const shouldShowResultsState =
    !state.isTestingQuality && Boolean(state.qualityResults || state.error);

  const shouldShowStoppedState = hasUserStoppedTest && !state.qualityResults && !state.error;

  useEffect(() => {
    if (!isPrecallNetworkTestOpen) return;

    if (hasUserStoppedTest) return;

    const hasExistingResultsOrError = Boolean(state.qualityResults || state.error);
    if (state.isTestingQuality || hasExistingResultsOrError) return;

    void handleStartTest();
  }, [
    isPrecallNetworkTestOpen,
    hasUserStoppedTest,
    state.isTestingQuality,
    state.qualityResults,
    state.error,
    handleStartTest,
  ]);

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

          {shouldShowTestingState && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  py: 2,
                  minHeight: 100,
                }}
              >
                <CircularProgress size={60} />
              </Box>
              <DialogActionsRow
                closeButtonText={t('button.close')}
                onClose={handleClose}
                actionButtonText={t('waitingRoom.precallNetworkTest.stopTest')}
                onActionClick={handleStopTest}
              />
            </Box>
          )}

          {shouldShowStoppedState && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  py: 2,
                  minHeight: 100,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.colors.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  {t('waitingRoom.precallNetworkTest.stoppedTitle')}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.colors.textSecondary,
                    textAlign: 'center',
                  }}
                >
                  {t('waitingRoom.precallNetworkTest.stoppedMessage')}
                </Typography>
              </Box>

              <DialogActionsRow
                closeButtonText={t('button.close')}
                onClose={handleClose}
                actionButtonText={t('waitingRoom.precallNetworkTest.retryTest')}
                onActionClick={handleRetry}
              />
            </Box>
          )}

          {shouldShowResultsState && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {state.error ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    py: 2,
                    minHeight: 100,
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

              <DialogActionsRow
                closeButtonText={t('button.close')}
                onClose={handleClose}
                actionButtonText={t('waitingRoom.precallNetworkTest.retryTest')}
                onActionClick={handleRetry}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PrecallNetworkTestDialog;
