import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import { Dispatch, ReactElement, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../ToolbarButton';
import EmojiGrid from '../EmojiGrid/EmojiGrid';
import VividIcon from '@components/VividIcon';
import { env } from '../../../env';
import { useIsHandRaisedFor } from '@core/stores';
import useSessionContext from '@hooks/useSessionContext';

/**
 * Monochrome raised-hand glyph for the toolbar indicator badge.
 * Inline SVG (rather than the `RAISED_HAND_EMOJI` codepoint used elsewhere)
 * so it picks up the badge's text color via `fill="currentColor"` — the unicode
 * emoji renders with the OS emoji font's fixed yellow palette and ignores
 * `text-vera-on-primary`, which made the badge yellow-on-purple instead of
 * white-on-purple.
 */
const RaisedHandIndicator = (): ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="0.9em"
    height="0.9em"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M14 2a2 2 0 0 1 2 2v4h.5a2 2 0 0 1 2 2v6a6 6 0 0 1-6 6h-1.17a6 6 0 0 1-4.24-1.76l-3.3-3.3a2 2 0 0 1 2.83-2.82L7 15.34V4a2 2 0 1 1 4 0v6h1V4a2 2 0 0 1 2-2z" />
  </svg>
);

export type EmojiGridProps = {
  isEmojiGridOpen: boolean;
  setIsEmojiGridOpen: Dispatch<SetStateAction<boolean>>;
  isParentOpen: boolean;
  isOverflowButton?: boolean;
};

/**
 * EmojiGridButton Component
 *
 * Displays a clickable button to open a grid of emojis.
 * @param {EmojiGridProps} props - the props for the component
 *  @property {boolean} isEmojiGridOpen - whether the component will be open initially
 *  @property {Dispatch<SetStateAction<boolean>>} setIsEmojiGridOpen - toggle whether the emoji grid is shown or hidden
 *  @property {boolean} isParentOpen - whether the ToolbarOverflowMenu is open
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement | false} - The EmojiGridButton Component.
 */
const EmojiGridButton = ({
  isEmojiGridOpen,
  setIsEmojiGridOpen,
  isParentOpen,
  isOverflowButton = false,
}: EmojiGridProps): ReactElement | false => {
  const { t } = useTranslation();
  const { getConnectionId } = useSessionContext();
  const localHandIsRaised = useIsHandRaisedFor(getConnectionId());
  const anchorRef = useRef<HTMLButtonElement>(null);
  const handleToggle = () => {
    setIsEmojiGridOpen((prevOpen) => !prevOpen);
  };

  return (
    env.ALLOW_EMOJIS && (
      <>
        <Tooltip title={t('emoji.tooltip')} aria-label={t('emoji.ariaLabel')}>
          <Badge
            data-testid="raise-hand-active-badge"
            badgeContent={localHandIsRaised ? <RaisedHandIndicator /> : null}
            invisible={!localHandIsRaised}
            overlap="circular"
            slotProps={{
              badge: {
                className:
                  'bg-vera-tertiary text-vera-on-tertiary text-vera-caption min-w-4 h-4 px-0.5',
              },
            }}
          >
            <ToolbarButton
              onClick={handleToggle}
              icon={
                <VividIcon
                  name="emoji-solid"
                  customSize={-5}
                  style={{
                    color: `${isEmojiGridOpen ? 'var(--vera-secondary-light)' : 'var(--vera-on-secondary-light)'} !important`,
                  }}
                />
              }
              ref={anchorRef}
              data-testid="emoji-grid-button"
              className={isOverflowButton ? 'mt-0!' : 'mt-1!'}
              isOverflowButton={isOverflowButton}
            />
          </Badge>
        </Tooltip>

        <EmojiGrid
          anchorRef={anchorRef}
          isEmojiGridOpen={isEmojiGridOpen}
          setIsEmojiGridOpen={setIsEmojiGridOpen}
          isParentOpen={isParentOpen}
        />
      </>
    )
  );
};

export default EmojiGridButton;
