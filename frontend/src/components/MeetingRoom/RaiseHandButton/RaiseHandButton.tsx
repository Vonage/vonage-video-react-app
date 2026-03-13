import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import useSessionContext from '@hooks/useSessionContext';

/**
 * RaiseHandButton Component
 *
 * A full-width labelled button rendered inside the Reactions (Emoji) panel.
 * Toggles the local user's raised-hand state. Label and aria-label swap between
 * "Raise hand" and "Lower hand" to reflect the current state.
 *
 * Active state (hand raised) uses the VERA primary highlight token so the
 * participant has clear visual confirmation their hand is up.
 */
const RaiseHandButton = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localHandIsRaised, raiseHand, lowerHand } = useSessionContext();

  const handleClick = () => {
    if (localHandIsRaised) {
      lowerHand();
    } else {
      raiseHand();
    }
  };

  const label = localHandIsRaised ? t('raiseHand.button.lower') : t('raiseHand.button.raise');

  return (
    <Button
      data-testid="raise-hand-button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={localHandIsRaised}
      fullWidth
      variant="text"
      sx={{
        justifyContent: 'center',
        px: 1.5,
        py: 1,
        borderRadius: 1,
        textTransform: 'none',
        backgroundColor: localHandIsRaised ? theme.colors.primary : 'transparent',
        color: localHandIsRaised ? theme.colors.onPrimary : theme.colors.onDarkGrey,
        border: localHandIsRaised ? `1px solid ${theme.colors.primary}` : '1px solid transparent',
        '&:hover': {
          backgroundColor: localHandIsRaised
            ? theme.colors.primaryHover
            : theme.colors.darkGreyHover,
        },
      }}
    >
      <Box
        component="span"
        sx={{ fontSize: '1.25rem', mr: 1.5, lineHeight: 1, flexShrink: 0 }}
        aria-hidden="true"
      >
        ✋
      </Box>
      <Typography variant="body2" noWrap>
        {label}
      </Typography>
    </Button>
  );
};

export default RaiseHandButton;
