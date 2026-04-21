import { ReactElement, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PortraitIcon from '@mui/icons-material/Portrait';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import useWindowWidth from '@hooks/useWindowWidth';
import usePublisherContext from '@hooks/usePublisherContext';
import useSessionContext from '@hooks/useSessionContext';
import useCameraToggle from '@hooks/useCameraToggle';
import { isMobile } from '@web/platform';
import Publisher from '@components/Publisher';
import useFloatingPip from '../../../hooks/useFloatingPip';
import { env } from '../../../env';

export type FloatingPipSelfViewProps = {
  canvasRef: RefObject<HTMLElement | null>;
};

const PIP_MIN_LONG_EDGE = 120;
const PIP_MAX_LONG_EDGE = 160;
const PIP_SIZE_RATIO = 0.32;
const PIP_FALLBACK_ASPECT = 16 / 9;
const PIP_MARGIN = 12;
const SNAP_TRANSITION_MS = 180;
const PIP_CONTROLS_HIDE_DELAY_MS = 3000;
const PIP_ICON_BUTTON_SIZE = 32;
// VideoTile subtracts an 8px vertical and 14px horizontal margin from the box
// it receives. We enlarge the box by the same amount so the visible tile fills
// the drag container exactly.
const PUBLISHER_BOX_HORIZONTAL_PADDING = 14;
const PUBLISHER_BOX_VERTICAL_PADDING = 8;

const computePipSize = (
  viewportWidth: number,
  viewportHeight: number,
  sourceAspect: number
): { width: number; height: number } => {
  const shorterSide = Math.min(viewportWidth, viewportHeight);
  const longEdge = Math.min(
    PIP_MAX_LONG_EDGE,
    Math.max(PIP_MIN_LONG_EDGE, shorterSide * PIP_SIZE_RATIO)
  );
  if (sourceAspect >= 1) {
    return { width: longEdge, height: longEdge / sourceAspect };
  }
  return { width: longEdge * sourceAspect, height: longEdge };
};

/**
 * FloatingPipSelfView
 *
 * Wraps the shared {@link Publisher} tile in a draggable, corner-snapping
 * overlay for the floating 1:1 layout. The tile itself (video mount, initials
 * fallback, audio indicator, mirror transform) is rendered by {@link Publisher}
 * with `hideName` — this component adds the drag mechanics, the tap-to-reveal
 * camera-switch / video-effects controls, and sizes the tile to match the
 * publisher's source aspect ratio so the local camera never letterboxes.
 */
const FloatingPipSelfView = ({ canvasRef }: FloatingPipSelfViewProps): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const viewportWidth = useWindowWidth();
  const viewportHeight = typeof window === 'undefined' ? viewportWidth : window.innerHeight;
  const [sourceAspect, setSourceAspect] = useState<number>(PIP_FALLBACK_ASPECT);
  const { width: pipWidth, height: pipHeight } = useMemo(
    () => computePipSize(viewportWidth, viewportHeight, sourceAspect),
    [viewportWidth, viewportHeight, sourceAspect]
  );

  const [shouldShowControls, setShouldShowControls] = useState<boolean>(false);

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      setShouldShowControls(false);
    }, PIP_CONTROLS_HIDE_DELAY_MS);
  }, []);

  const handleTap = useCallback(() => {
    setShouldShowControls((previous) => {
      const next = !previous;
      if (next) scheduleHideControls();
      return next;
    });
  }, [scheduleHideControls]);

  const { position, isDragging, onPointerDown, onPointerMove, onPointerUp } = useFloatingPip({
    canvasRef,
    pipWidth,
    pipHeight,
    margin: PIP_MARGIN,
    initialCorner: 'bottom-right',
    onTap: handleTap,
  });

  useEffect(
    () => () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    },
    []
  );

  const { publisherVideoElement } = usePublisherContext();
  const { toggleBackgroundEffects } = useSessionContext();
  const { canSwitch: canSwitchCamera, handleToggle: handleCameraSwitch } = useCameraToggle();
  const shouldShowBackgroundEffects = hasMediaProcessorSupport() && env.ALLOW_BACKGROUND_EFFECTS;
  const shouldShowCameraSwitch = isMobile() && canSwitchCamera;

  useEffect(() => {
    if (!publisherVideoElement) return undefined;
    const videoElement =
      publisherVideoElement instanceof HTMLVideoElement
        ? publisherVideoElement
        : publisherVideoElement.querySelector('video');
    if (!videoElement) return undefined;
    const readAspect = () => {
      if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        setSourceAspect(videoElement.videoWidth / videoElement.videoHeight);
      }
    };
    readAspect();
    videoElement.addEventListener('loadedmetadata', readAspect);
    videoElement.addEventListener('resize', readAspect);
    return () => {
      videoElement.removeEventListener('loadedmetadata', readAspect);
      videoElement.removeEventListener('resize', readAspect);
    };
  }, [publisherVideoElement]);

  const publisherBox = useMemo(
    () => ({
      left: 0,
      top: 0,
      width: pipWidth + PUBLISHER_BOX_HORIZONTAL_PADDING,
      height: pipHeight + PUBLISHER_BOX_VERTICAL_PADDING,
    }),
    [pipWidth, pipHeight]
  );

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={t('floatingPip.selfTile.ariaLabel')}
      data-testid="floating-pip-self"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      sx={{
        position: 'absolute',
        left: position ? `${position.x}px` : undefined,
        top: position ? `${position.y}px` : undefined,
        width: `${pipWidth}px`,
        height: `${pipHeight}px`,
        display: position ? 'block' : 'none',
        borderRadius: theme.shapes.borderRadiusLarge,
        overflow: 'hidden',
        backgroundColor: theme.colors.darkGrey,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging
          ? 'none'
          : `left ${SNAP_TRANSITION_MS}ms ease-out, top ${SNAP_TRANSITION_MS}ms ease-out`,
        boxShadow: `0 4px 12px ${theme.colors.darkBackground}`,
      }}
    >
      <Publisher box={publisherBox} hideName />
      {shouldShowCameraSwitch && shouldShowControls && (
        <Box
          component="span"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          sx={{
            position: 'absolute',
            bottom: 4,
            left: 4,
          }}
        >
          <Tooltip title={t('devices.video.camera.switch')} placement="top">
            <IconButton
              className="bg-vera-dark-grey-opacity text-vera-on-dark-grey"
              data-testid="floating-pip-camera-switch"
              onClick={() => {
                handleCameraSwitch();
                scheduleHideControls();
              }}
              size="small"
              sx={{ width: PIP_ICON_BUTTON_SIZE, height: PIP_ICON_BUTTON_SIZE, padding: 0 }}
            >
              <VividIcon
                name="camera-switch-line"
                customSize={-4}
                className="text-vera-on-dark-grey"
              />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      {shouldShowBackgroundEffects && shouldShowControls && (
        <Box
          component="span"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          sx={{
            position: 'absolute',
            bottom: 4,
            right: 4,
          }}
        >
          <Tooltip title={t('backgroundEffects.title')} placement="top">
            <IconButton
              className="bg-vera-dark-grey-opacity text-vera-on-dark-grey"
              data-testid="floating-pip-background-effects"
              onClick={() => {
                toggleBackgroundEffects();
                scheduleHideControls();
              }}
              size="small"
              sx={{ width: PIP_ICON_BUTTON_SIZE, height: PIP_ICON_BUTTON_SIZE, padding: 0 }}
            >
              <PortraitIcon sx={{ fontSize: 28, color: theme.colors.onDarkGrey }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default FloatingPipSelfView;
