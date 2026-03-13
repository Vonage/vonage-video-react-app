import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import useTheme from '@ui/theme';
import useSessionContext from '@hooks/useSessionContext';
import { isModeratorRole } from '../../../utils/raiseHandRole';
import LowerAllDialog from './LowerAllDialog';

/**
 * RaisedHandsSection Component
 *
 * Renders a dedicated section at the top of the Participants panel listing all
 * participants who have raised their hand, ordered chronologically (first raised
 * = first in queue). Visible only when raisedHandCount > 0.
 *
 * Moderators can lower individual hands or all hands at once (guarded by
 * isModeratorRole() — always true in v1).
 */
const RaisedHandsSection = (): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { raisedHands, raisedHandCount, lowerHand, lowerAllHands } = useSessionContext();
  const [isLowerAllDialogOpen, setIsLowerAllDialogOpen] = useState(false);

  const handleLowerAllClick = () => setIsLowerAllDialogOpen(true);
  const handleLowerAllConfirm = () => {
    lowerAllHands();
    setIsLowerAllDialogOpen(false);
  };
  const handleLowerAllCancel = () => setIsLowerAllDialogOpen(false);

  return (
    <>
      {/* Section header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 1.5,
          pb: 0.5,
        }}
        data-testid="raised-hands-section"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ color: theme.colors.textSecondary }}>
            {t('raiseHand.section.title')}
          </Typography>
          <Badge
            badgeContent={raisedHandCount}
            data-testid="raised-hands-count-badge"
            sx={{
              '& .MuiBadge-badge': {
                position: 'relative',
                transform: 'none',
                backgroundColor: theme.colors.primary,
                color: theme.colors.onPrimary,
                fontSize: '0.7rem',
                minWidth: '20px',
                height: '20px',
                borderRadius: '10px',
              },
            }}
          />
        </Box>

        {isModeratorRole() && (
          <Button
            data-testid="lower-all-button"
            variant="text"
            size="small"
            onClick={handleLowerAllClick}
            sx={{
              color: theme.colors.textPrimary,
              textTransform: 'none',
              fontSize: '0.8rem',
              p: 0,
              minWidth: 'auto',
              '&:hover': { textDecoration: 'underline', background: 'transparent' },
            }}
          >
            {t('raiseHand.section.lowerAll')}
          </Button>
        )}
      </Box>

      {/* Queue list */}
      <List dense disablePadding sx={{ px: 1 }}>
        {raisedHands.map((state) => (
          <ListItem
            key={state.connectionId}
            data-testid={`raised-hand-item-${state.connectionId}`}
            sx={{ pr: isModeratorRole() ? '48px' : 1 }}
            secondaryAction={
              isModeratorRole() ? (
                <Tooltip
                  title={t('raiseHand.section.lowerParticipant', { name: state.participantName })}
                >
                  <IconButton
                    size="small"
                    aria-label={t('raiseHand.section.lowerParticipant', {
                      name: state.participantName,
                    })}
                    data-testid={`lower-hand-${state.connectionId}`}
                    onClick={() => lowerHand(state.connectionId)}
                    sx={{ color: theme.colors.textTertiary }}
                  >
                    <span role="img" aria-hidden="true" style={{ fontSize: '1rem' }}>
                      ✋
                    </span>
                  </IconButton>
                </Tooltip>
              ) : undefined
            }
          >
            <ListItemText
              primary={state.participantName}
              primaryTypographyProps={{ variant: 'body2', noWrap: true }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mt: 1, mx: 2 }} />

      {/* Confirmation dialog */}
      <LowerAllDialog
        open={isLowerAllDialogOpen}
        raisedHandCount={raisedHandCount}
        onConfirm={handleLowerAllConfirm}
        onCancel={handleLowerAllCancel}
      />
    </>
  );
};

export default RaisedHandsSection;
