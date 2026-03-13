import { ReactElement } from 'react';
import Box from '@mui/material/Box';

/**
 * RaiseHandBadge Component
 *
 * Renders the ✋ emoji badge overlaid in the top-left corner of a participant's video tile.
 * Visible to all participants when a hand is raised. Animates in with a scale + fade effect.
 * No background container — emoji only with a drop-shadow for readability on dark tiles.
 */
const RaiseHandBadge = (): ReactElement => (
  <Box
    aria-label="Hand raised"
    data-testid="raise-hand-badge"
    sx={{
      position: 'absolute',
      top: '8px',
      left: '8px',
      fontSize: 'clamp(24px, 3vw, 40px)',
      lineHeight: 1,
      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))',
      userSelect: 'none',
      pointerEvents: 'none',
      zIndex: 10,
      animation: 'raiseHandIn 150ms ease-out both',
      '@keyframes raiseHandIn': {
        from: { opacity: 0, transform: 'scale(0.6)' },
        to: { opacity: 1, transform: 'scale(1)' },
      },
    }}
  >
    ✋
  </Box>
);

export default RaiseHandBadge;
