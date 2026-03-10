import Tooltip from '@mui/material/Tooltip';
import { Dispatch, ReactElement, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useTheme from '@ui/theme';
import ToolbarButton from '../ToolbarButton';
import EmojiGrid from '../EmojiGrid/EmojiGrid';
import VividIcon from '@components/VividIcon';
import { env } from '../../../env';

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
  const theme = useTheme();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const handleToggle = () => {
    setIsEmojiGridOpen((prevOpen) => !prevOpen);
  };

  return (
    env.ALLOW_EMOJIS && (
      <>
        <Tooltip title={t('emoji.tooltip')} aria-label={t('emoji.ariaLabel')}>
          <ToolbarButton
            onClick={handleToggle}
            icon={
              <VividIcon
                name="emoji-solid"
                customSize={-5}
                sx={{
                  color: isEmojiGridOpen ? theme.colors.secondary : theme.colors.onSecondary,
                }}
              />
            }
            ref={anchorRef}
            data-testid="emoji-grid-button"
            sx={{
              marginTop: isOverflowButton ? '0px' : '4px',
            }}
            isOverflowButton={isOverflowButton}
          />
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
