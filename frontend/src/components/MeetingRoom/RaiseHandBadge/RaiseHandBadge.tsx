import { ReactElement } from 'react';
import Box from '@mui/material/Box';

export type RaiseHandBadgeProps = {
  /**
   * Width of the containing tile in pixels.
   * When provided, the badge scales proportionally:
   *   - font-size : ~8% of tile width, minimum 16 px (no upper cap — matches WebEx ratio at all sizes)
   *   - corner offset: ~1.5% of tile width, minimum 8 px
   * Falls back to viewport-relative values when omitted.
   */
  tileWidth?: number;
};

/**
 * RaiseHandBadge Component
 *
 * Renders the ✋ emoji badge overlaid in the top-left corner of a participant's video tile.
 * Visible to all participants when a hand is raised. Animates in with a spin + spring effect
 * (full rotation, scale overshoot, settle). No background container — emoji only with a
 * drop-shadow for readability on dark tiles.
 * @param {RaiseHandBadgeProps} props - The props for the component.
 *   @property {number} [tileWidth] - Width of the tile in px; drives proportional badge sizing.
 * @returns {ReactElement} The badge element.
 */
const RaiseHandBadge = ({ tileWidth }: RaiseHandBadgeProps): ReactElement => {
  // ~8% of tile width, no upper cap — keeps the same visual proportion at every tile size
  const fontSize = tileWidth
    ? `${Math.max(Math.round(tileWidth * 0.08), 16)}px`
    : 'clamp(16px, 3vw, 96px)';

  // ~1.5% of tile width so the badge breathes away from the corner proportionally
  const offset = tileWidth
    ? `${Math.max(Math.round(tileWidth * 0.015), 8)}px`
    : '12px';

  return (
    <Box
      aria-label="Hand raised"
      data-testid="raise-hand-badge"
      sx={{
        position: 'absolute',
        top: offset,
        left: offset,
        fontSize,
        lineHeight: 1,
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))',
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 10,
        animation: 'raiseHandIn 600ms ease-out both',
        '@keyframes raiseHandIn': {
          '0%':   { opacity: 0, transform: 'scale(0.3) rotate(-270deg)' },
          '20%':  { opacity: 1, transform: 'scale(0.7) rotate(-100deg)' },
          '60%':  { transform: 'scale(1.2) rotate(15deg)' },
          '80%':  { transform: 'scale(0.9) rotate(-5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
      }}
    >
      ✋
    </Box>
  );
};

export default RaiseHandBadge;
