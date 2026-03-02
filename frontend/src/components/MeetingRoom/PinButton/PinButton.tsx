import { MouseEvent, ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import isMouseEventInsideBox from '../../../utils/isMouseEventInsideBox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VividIcon from '@components/VividIcon';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import { ABSOLUTE_DISTANCE_THRESHOLD_REM_VALUE } from '@utils/constants';
import toRemValue from '@common/helpers/toRemValue';

export type PinButtonProps = {
  isMaxPinned: boolean;
  isPinned: boolean;
  isTileHovered: boolean;
  participantName?: string;
  handleClick: (clickEvent: MouseEvent<HTMLButtonElement>) => void;
};

/**
 * PinButton Component
 *
 * This component renders a button to pin and unpin a participants video, as well as displaying current pinned status.
 * @param {PinButtonProps} pinButtonProps - component props
 *  @property {boolean} isMaxPinned - Indicates whether the maximum number of participants have already been pinned.
 *  @property {boolean} isPinned - Indicates whether this participant is pinned.
 *  @property {boolean} isTileHovered - Indicates whether the video tile is being hovered.
 *  @property {string | undefined} participantName - the name of the participant that can be muted.
 *  @property {Function} handleClick - click handler, used to toggle participant isPinned state.
 * @returns {ReactElement | false} PinButton
 */
const PinButton = ({
  isMaxPinned,
  isPinned,
  isTileHovered,
  participantName,
  handleClick,
}: PinButtonProps): ReactElement | false => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDisabled = isMaxPinned && !isPinned;
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [isHoveringButton, setIsHoveringButton] = useState<boolean>(false);
  const iconSx = {
    color: isDisabled ? theme.colors.disabled : theme.colors.accent,
    cursor: 'pointer',
  };

  const getTooltipText = () => {
    if (isDisabled) {
      return t('participants.maxPin');
    }
    if (isPinned) {
      return t('participants.unpin.video', { participantName });
    }
    return t('participants.pin.video', { participantName });
  };

  const onClick = (clickEvent: MouseEvent<HTMLButtonElement>) => {
    handleClick(clickEvent);
    // We set hovering to false manually since onMouseLeave is not invoked when the DOM Element is moved.
    setIsHoveringButton(false);
    // In case the DOM Element didn't move, which can happen if pinning while viewing screenshare -
    // we use setTimeout to let the new layout render, then check if the element is still under the click event location.
    // If so we re-enable the hover state.
    setTimeout(() => {
      if (anchorRef.current) {
        const divRect = anchorRef.current.getBoundingClientRect();
        if (isMouseEventInsideBox(clickEvent, divRect)) {
          setIsHoveringButton(true);
        }
      }
    }, 0);
  };

  const shouldShowIcon = isTileHovered || isPinned;
  const pinButtonHorizontalOffsetRemValue = 0.3;
  const pinButtonLeftOffsetRemValue =
    ABSOLUTE_DISTANCE_THRESHOLD_REM_VALUE + pinButtonHorizontalOffsetRemValue;

  return (
    shouldShowIcon && (
      <Box
        ref={anchorRef}
        sx={{
          position: 'absolute',
          left: toRemValue(pinButtonLeftOffsetRemValue),
          top: toRemValue(ABSOLUTE_DISTANCE_THRESHOLD_REM_VALUE),
          margin: 'auto',
          display: 'flex',
          width: '24px',
          height: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.shapes.borderRadiusLarge,
        }}
        data-testid="pin-button"
        onPointerEnter={() => setIsHoveringButton(true)}
        onPointerLeave={() => setIsHoveringButton(false)}
        onBlur={() => setIsHoveringButton(false)}
      >
        <Tooltip title={getTooltipText()} disableFocusListener open={isHoveringButton}>
          <IconButton
            disabled={isDisabled}
            onClick={onClick}
            sx={{
              height: 24,
              width: 24,
              borderRadius: '50%',
              cursor: 'pointer',
              backgroundColor: isTileHovered ? theme.colors.darkGrey : 'none',
              '&:hover, &.Mui-focusVisible': { backgroundColor: theme.colors.darkGreyHover },
            }}
          >
            {isTileHovered && isPinned ? (
              <VividIcon name="pin-2-off-solid" customSize={-6} sx={iconSx} />
            ) : (
              <VividIcon name="pin-2-solid" customSize={-6} sx={iconSx} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    )
  );
};

export default PinButton;
