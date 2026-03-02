import { ReactElement, RefObject, useState } from 'react';
import { VideoContentHint } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import useTheme from '@ui/theme';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Tooltip from '@mui/material/Tooltip';

export type ContentHintMenuProps = {
  anchorRef: RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  isSharingScreen: boolean;
  selectedHint: VideoContentHint;
  currentContentHint: VideoContentHint;
  onHintChange: (hint: VideoContentHint) => void;
  onShare: () => void;
  onApply: () => void;
  onCancel: () => void;
  onMenuMouseEnter: () => void;
  onMenuMouseLeave: () => void;
  handleClose: (event: MouseEvent | TouchEvent) => void;
};

type HintOption = {
  value: VideoContentHint;
  labelKey: string;
  descriptionKey: string;
};

/**
 * The available video content hint values exposed in the UI.
 * Each value maps directly to the `VideoContentHint` type in the Vonage Video SDK and the
 * underlying W3C MediaStreamTrack Content Hints specification.
 *
 * @see {@link https://developer.vonage.com/en/video/guides/streams/publish-settings#video-content-hints} Vonage — Publish settings: Video content hints
 * @see {@link https://www.w3.org/TR/mst-content-hint/#video-content-hints} W3C — MediaStreamTrack Content Hints: Video content hints
 */
const HINT_OPTIONS: HintOption[] = [
  {
    value: 'motion',
    labelKey: 'screenSharing.contentHint.motion',
    descriptionKey: 'screenSharing.contentHint.motion.description',
  },
  {
    value: 'detail',
    labelKey: 'screenSharing.contentHint.detail',
    descriptionKey: 'screenSharing.contentHint.detail.description',
  },
  {
    value: 'text',
    labelKey: 'screenSharing.contentHint.text',
    descriptionKey: 'screenSharing.contentHint.text.description',
  },
];

/**
 * ContentHintMenu Component
 *
 * A popover menu anchored to the screen share toolbar button that allows the user to select
 * a videoContentHint optimization mode before starting screen share, or change it on the fly
 * while already sharing.
 *
 * The UI design — a dropdown with an ⓘ info button showing per-option descriptions on hover —
 * is inspired by the equivalent screen sharing optimization selector in Cisco WebEx.
 *
 * @param {ContentHintMenuProps} props - The props for the component.
 * @returns {ReactElement} The ContentHintMenu component.
 */
const ContentHintMenu = ({
  anchorRef,
  isOpen,
  isSharingScreen,
  selectedHint,
  currentContentHint,
  onHintChange,
  onShare,
  onApply,
  onCancel,
  onMenuMouseEnter,
  onMenuMouseLeave,
  handleClose,
}: ContentHintMenuProps): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Track whether the MUI Select dropdown is open so we can suppress
  // the ClickAwayListener while the dropdown portal is visible.
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  // When sharing, only show the primary action button if the user has
  // actually changed the hint away from the currently active value.
  const showPrimaryAction = isSharingScreen ? selectedHint !== currentContentHint : true;

  const primaryActionLabel = isSharingScreen
    ? t('screenSharing.contentHint.apply')
    : t('screenSharing.contentHint.share');

  const handlePrimaryAction = () => {
    if (isSharingScreen) {
      onApply();
    } else {
      onShare();
    }
  };

  // Build the tooltip content for the ⓘ button — one entry per option.
  const infoTooltipContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 280 }}>
      {HINT_OPTIONS.map(({ value, labelKey, descriptionKey }) => (
        <Box key={value}>
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
            {t(labelKey)}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>
            {t(descriptionKey)}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Popper
      open={isOpen}
      anchorEl={anchorRef.current}
      transition
      disablePortal
      placement="top"
      data-testid="content-hint-menu"
      sx={{ zIndex: 1300 }}
    >
      {({ TransitionProps }) => (
        <Grow {...TransitionProps} style={{ transformOrigin: 'center bottom' }}>
          <Box>
            <ClickAwayListener onClickAway={isSelectOpen ? () => {} : handleClose}>
              <Paper
                onMouseEnter={onMenuMouseEnter}
                onMouseLeave={onMenuMouseLeave}
                sx={{
                  backgroundColor: theme.colors.darkBackground,
                  color: theme.colors.onSurface,
                  padding: 2.5,
                  borderRadius: 2,
                  width: 340,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  mb: 1,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {/* Instruction text */}
                <Typography variant="body2" sx={{ color: theme.colors.onSurface, lineHeight: 1.5 }}>
                  {isSharingScreen
                    ? t('screenSharing.contentHint.applyInstruction')
                    : t('screenSharing.contentHint.shareInstruction')}
                </Typography>

                {/* Label + Select + Info icon */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.colors.onSurface, mb: 0.75, display: 'block', opacity: 0.8 }}
                  >
                    {t('screenSharing.contentHint.label')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl size="small" fullWidth>
                      <Select
                        data-testid="content-hint-select"
                        value={selectedHint}
                        onChange={(e) => onHintChange(e.target.value as VideoContentHint)}
                        onOpen={() => setIsSelectOpen(true)}
                        onClose={() => setIsSelectOpen(false)}
                        sx={{
                          color: theme.colors.onSurface,
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: `${theme.colors.onSurface}55`,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.colors.onSurface,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.colors.onSurface,
                          },
                          '.MuiSvgIcon-root': {
                            color: theme.colors.onSurface,
                          },
                        }}
                      >
                        {HINT_OPTIONS.map(({ value, labelKey }) => (
                          <MenuItem key={value} value={value}>
                            {t(labelKey)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Info icon button */}
                    <Tooltip title={infoTooltipContent} placement="right" arrow enterDelay={100}>
                      <IconButton
                        size="small"
                        data-testid="content-hint-info-button"
                        sx={{
                          color: `${theme.colors.onSurface}99`,
                          flexShrink: 0,
                          '&:hover': { color: theme.colors.onSurface },
                        }}
                      >
                        <InfoOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Primary action button (Share / Apply) — hidden while sharing
                    until the user selects a different hint */}
                {showPrimaryAction && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handlePrimaryAction}
                    data-testid="content-hint-primary-button"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 6,
                      py: 1.25,
                    }}
                  >
                    {primaryActionLabel}
                  </Button>
                )}

                {/* Cancel link */}
                <Button
                  variant="text"
                  fullWidth
                  onClick={onCancel}
                  data-testid="content-hint-cancel-button"
                  sx={{
                    color: `${theme.colors.onSurface}99`,
                    textTransform: 'none',
                    mt: -1,
                    '&:hover': { color: theme.colors.onSurface },
                  }}
                >
                  {t('screenSharing.contentHint.cancel')}
                </Button>
              </Paper>
            </ClickAwayListener>
          </Box>
        </Grow>
      )}
    </Popper>
  );
};

export default ContentHintMenu;
