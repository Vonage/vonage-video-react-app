import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@ui/theme';
import useSessionContext from '@hooks/useSessionContext';

/**
 * SelfLowerPill Component
 *
 * A persistent "✋ Lower hand" pill that is overlaid at the bottom-centre of the
 * local participant's own video tile when `localHandIsRaised === true`.
 *
 * Gives the participant a one-tap shortcut to lower their hand without having
 * to re-open the Reactions panel.
 */
const SelfLowerPill = (): ReactElement | null => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localHandIsRaised, lowerHand } = useSessionContext();

  if (!localHandIsRaised) return null;

  return (
    <Box
      component="button"
      data-testid="self-lower-pill"
      onClick={() => lowerHand()}
      aria-label={t('raiseHand.selfLowerPill.ariaLabel')}
      sx={{
        position: 'absolute',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: '20px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: theme.colors.darkGreyOpacity,
        color: theme.colors.onDarkGrey,
        whiteSpace: 'nowrap',
        animation: 'selfLowerPillIn 150ms ease-out both',
        '@keyframes selfLowerPillIn': {
          from: { opacity: 0, transform: 'translateX(-50%) scale(0.8)' },
          to: { opacity: 1, transform: 'translateX(-50%) scale(1)' },
        },
        '&:hover': { backgroundColor: theme.colors.darkGreyHover },
      }}
    >
      <Box component="span" aria-hidden="true" sx={{ fontSize: '0.875rem' }}>✋</Box>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {t('raiseHand.selfLowerPill.label')}
      </Typography>
    </Box>
  );
};

export default SelfLowerPill;
