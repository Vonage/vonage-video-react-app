import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { RAISED_HAND_EMOJI } from '../../../../utils/emojis';

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

const RaiseHandBadge = ({ tileWidth }: RaiseHandBadgeProps): ReactElement => {
  const { t } = useTranslation();
  // Scale by tile width (~8% font, ~1.5% offset) so the badge keeps the same
  // visual proportion at every tile size, with a viewport-relative fallback.
  const fontSize = tileWidth
    ? `${Math.max(Math.round(tileWidth * 0.08), 16)}px`
    : 'clamp(16px, 3vw, 96px)';
  const offset = tileWidth ? `${Math.max(Math.round(tileWidth * 0.015), 8)}px` : '12px';

  return (
    <div
      aria-label={t('raiseHand.badge.ariaLabel')}
      data-testid="raise-hand-badge"
      className="absolute leading-none select-none pointer-events-none z-10 drop-shadow-[0_1px_3px_var(--vera-dark-grey-opacity)] animate-raise-hand-in"
      style={{ fontSize, top: offset, left: offset }}
    >
      <span role="img" aria-hidden="true">
        {RAISED_HAND_EMOJI}
      </span>
    </div>
  );
};

export default RaiseHandBadge;
