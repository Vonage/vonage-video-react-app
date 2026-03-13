import { ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import useTheme from '@ui/theme';
import useSessionContext from '@hooks/useSessionContext';

const MAX_POPOVER_NAMES = 3;

/**
 * RaiseHandPill Component
 *
 * A persistent ambient indicator rendered in the MeetingRoom header area.
 * Visible whenever raisedHandCount > 0. Shows the name of the first participant
 * in the queue (earliest timestamp).
 *
 * - Click → opens the Participants panel to view the full queue.
 * - Hover → shows a floating mini-popover: first 3 names + "View all (N) >" CTA.
 */
const RaiseHandPill = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { raisedHands, raisedHandCount, toggleParticipantList } = useSessionContext();
  const [hoverOpen, setHoverOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const firstInQueue = raisedHands[0];

  return (
    <>
      <Box
        component="button"
        ref={anchorRef}
        data-testid="raise-hand-pill"
        onClick={toggleParticipantList}
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
        aria-label={t('raiseHand.pill.ariaLabel', { name: firstInQueue?.participantName ?? '' })}
        sx={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.5,
          py: 0.75,
          borderRadius: '20px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: theme.colors.primary,
          color: theme.colors.onPrimary,
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          animation: 'pillFadeIn 200ms ease-out both',
          '@keyframes pillFadeIn': {
            from: { opacity: 0, transform: 'translateX(-50%) translateY(-8px)' },
            to: { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
          },
          '&:hover': { backgroundColor: theme.colors.primaryHover },
        }}
      >
        <Box component="span" aria-hidden="true" sx={{ fontSize: '1rem' }}>
          ✋
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>
          {firstInQueue?.participantName}
        </Typography>
        {raisedHandCount > 1 && (
          <Typography variant="caption" sx={{ opacity: 0.8, ml: 0.25 }}>
            +{raisedHandCount - 1}
          </Typography>
        )}
      </Box>

      {/* Hover popover */}
      <Popper
        open={hoverOpen}
        anchorEl={anchorRef.current}
        placement="bottom"
        transition
        style={{ zIndex: 1201 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <Paper
              data-testid="raise-hand-pill-popover"
              elevation={4}
              onMouseEnter={() => setHoverOpen(true)}
              onMouseLeave={() => setHoverOpen(false)}
              sx={{
                mt: 0.5,
                minWidth: '180px',
                maxWidth: '240px',
                backgroundColor: theme.colors.darkGrey,
                color: theme.colors.onDarkGrey,
                borderRadius: 1.5,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, textTransform: 'uppercase', opacity: 0.7 }}
                >
                  {t('raiseHand.pill.popoverTitle')}
                </Typography>
              </Box>
              <List dense disablePadding>
                {raisedHands.slice(0, MAX_POPOVER_NAMES).map((h) => (
                  <ListItem key={h.connectionId} sx={{ py: 0.25 }}>
                    <Box component="span" aria-hidden="true" sx={{ mr: 1 }}>
                      ✋
                    </Box>
                    <ListItemText
                      primary={h.participantName}
                      primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                    />
                  </ListItem>
                ))}
              </List>
              {raisedHandCount > MAX_POPOVER_NAMES && (
                <Box sx={{ px: 2, pb: 1.5, pt: 0.5 }}>
                  <Button
                    size="small"
                    onClick={toggleParticipantList}
                    sx={{
                      color: theme.colors.primary,
                      textTransform: 'none',
                      p: 0,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  >
                    {t('raiseHand.pill.viewAll', { count: raisedHandCount })} &rsaquo;
                  </Button>
                </Box>
              )}
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default RaiseHandPill;
