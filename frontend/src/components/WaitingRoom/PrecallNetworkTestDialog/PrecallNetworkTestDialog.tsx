import { ReactElement, useEffect, useState, useMemo } from 'react';
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
  const [hasRunTest, setHasRunTest] = useState(false);

  const handleClose = () => {
    stopTest();
    clearResults();
    setHasRunTest(false);
    setIsPrecallNetworkTestOpen(false);
  };

  const handleRetry = async () => {
    clearResults();
    setHasRunTest(false);
    try {
      await testQuality(roomName);
      setHasRunTest(true);
    } catch (error) {
      console.error('Network test failed:', error);
      setHasRunTest(true);
    }
  };

  const handleStopTest = () => {
    stopTest();
    clearResults();
    setHasRunTest(false);
    setIsPrecallNetworkTestOpen(false);
  };

  useEffect(() => {
    if (
      isPrecallNetworkTestOpen &&
      !state.isTestingQuality &&
      !state.qualityResults &&
      !hasRunTest
    ) {
      testQuality(roomName)
        .then(() => {
          setHasRunTest(true);
        })
        .catch((error) => {
          console.error('Network test failed:', error);
          setHasRunTest(true);
        });
    }
  }, [
    isPrecallNetworkTestOpen,
    state.isTestingQuality,
    state.qualityResults,
    hasRunTest,
    testQuality,
    roomName,
  ]);

  const audioScore = state.qualityResults?.audio?.mos
    ? Math.round(state.qualityResults.audio.mos * 100) / 100
    : null;
  const videoScore = state.qualityResults?.video?.mos
    ? Math.round(state.qualityResults.video.mos * 100) / 100
    : null;

  const audioSupportTitle = useMemo(() => {
    if (audioScore === null) return undefined;
    return t(
      audioScore >= 3
        ? 'waitingRoom.precallNetworkTest.audioSupported'
        : 'waitingRoom.precallNetworkTest.audioNotSupported'
    );
  }, [audioScore, t]);

  const videoSupportTitle = useMemo(() => {
    if (videoScore === null) return undefined;
    return t(
      videoScore >= 3
        ? 'waitingRoom.precallNetworkTest.videoSupported'
        : 'waitingRoom.precallNetworkTest.videoNotSupported'
    );
  }, [videoScore, t]);

  const formatScore = (score: number | null): string => {
    if (score === null) return '—';
    return `${score.toFixed(2)}/5`;
  };

  return (
    <Dialog open={isPrecallNetworkTestOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 0, pl: 3, pt: 3, backgroundColor: theme.colors.surface }}>
        <Typography
          component="div"
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
            position: 'absolute',
            right: 16,
            top: 16,
            color: theme.colors.secondary,
          }}
        >
          <VividIcon name="close-line" customSize={-5} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: theme.colors.surface, pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
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
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  py: 4,
                  backgroundColor: theme.colors.background,
                }}
              >
                <CircularProgress size={60} />
              </Box>
              <Button
                variant="outlined"
                onClick={handleStopTest}
                sx={{
                  mt: 2,
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.onPrimary,
                  minWidth: '400px',
                  display: 'flex',
                  gap: 2,
                }}
              >
                <VividIcon name="stop-line" customSize={-6} />
                {t('waitingRoom.precallNetworkTest.stopTest')}
              </Button>
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
                  <Typography variant="h6" sx={{ color: theme.colors.error, textAlign: 'center' }}>
                    <span role="img" aria-label={t('waitingRoom.precallNetworkTest.error')}>
                      ❌
                    </span>{' '}
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      p: 1,
                      textAlign: 'center',
                    }}
                    title={audioSupportTitle}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.colors.textSecondary,
                        fontWeight: theme.typography.weight['body-base'].value,
                      }}
                    >
                      {t('waitingRoom.precallNetworkTest.audio')}
                    </Typography>
                    <Typography variant="h5" sx={{ lineHeight: 1 }}>
                      {audioScore && audioScore >= 3 ? (
                        <VividIcon
                          name="check-circle-line"
                          customSize={0}
                          sx={{
                            color: theme.colors.success,
                          }}
                        />
                      ) : (
                        <VividIcon
                          name="close-circle-line"
                          customSize={0}
                          sx={{
                            color: theme.colors.error,
                          }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.colors.textSecondary, ml: 2 }}>
                      {t('waitingRoom.precallNetworkTest.qualityLabel')}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.colors.textSecondary,
                        fontWeight: 'bold',
                      }}
                    >
                      {formatScore(audioScore)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      p: 1,
                      textAlign: 'center',
                    }}
                    title={videoSupportTitle}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.colors.textSecondary,
                        fontWeight: theme.typography.weight['body-base'].value,
                      }}
                    >
                      {t('waitingRoom.precallNetworkTest.video')}
                    </Typography>
                    <Typography variant="h5" sx={{ lineHeight: 1 }}>
                      {videoScore && videoScore >= 3 ? (
                        <VividIcon
                          name="check-circle-line"
                          customSize={0}
                          sx={{
                            color: theme.colors.success,
                          }}
                        />
                      ) : (
                        <VividIcon
                          name="close-circle-line"
                          customSize={0}
                          sx={{
                            color: theme.colors.error,
                          }}
                        />
                      )}
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.colors.textSecondary, ml: 2 }}>
                      {t('waitingRoom.precallNetworkTest.qualityLabel')}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.colors.textSecondary,
                        fontWeight: 'bold',
                      }}
                    >
                      {formatScore(videoScore)}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleRetry}
                  sx={{
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border,
                    minWidth: '180px',
                  }}
                >
                  {t('waitingRoom.precallNetworkTest.retryTest')}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleClose}
                  sx={{
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.onPrimary,
                    minWidth: '180px',
                  }}
                >
                  {t('button.close')}
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
