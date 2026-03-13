import { ReactElement } from 'react';

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
    <div
      aria-label="Hand raised"
      data-testid="raise-hand-badge"
      className="absolute leading-none select-none pointer-events-none z-10 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] animate-raise-hand-in"
      style={{ fontSize, top: offset, left: offset }}
    >
      ✋
    </div>
  );
};

export default RaiseHandBadge;
