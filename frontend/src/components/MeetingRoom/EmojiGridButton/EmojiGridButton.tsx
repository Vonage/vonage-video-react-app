import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import { Dispatch, ReactElement, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import ToolbarButton from '../ToolbarButton';
import EmojiGrid from '../EmojiGrid/EmojiGrid';
import VividIcon from '@components/VividIcon';
import { env } from '../../../env';
import { useIsHandRaisedFor } from '@core/stores';
import useSessionContext from '@hooks/useSessionContext';
import emojiMap from '../../../utils/emojis';

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
            badgeContent={localHandIsRaised ? emojiMap.RAISED_HAND : null}
            invisible={!localHandIsRaised}
            overlap="circular"
            slotProps={{
              badge: {
                className: 'bg-vera-primary text-vera-on-primary text-[0.7rem] min-w-4 h-4 px-0.5',
              },
            }}
          >
            <ToolbarButton
              onClick={handleToggle}
              icon={
                <VividIcon
                  name="emoji-solid"
                  customSize={-5}
                  className={classNames({
                    'text-vera-secondary': isEmojiGridOpen,
                    'text-vera-on-secondary': !isEmojiGridOpen,
                  })}
                />
              }
              ref={anchorRef}
              data-testid="emoji-grid-button"
              sx={{
                marginTop: isOverflowButton ? '0px' : '4px',
              }}
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
