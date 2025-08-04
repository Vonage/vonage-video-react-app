import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { t } from 'i18next';
import usePublisherContext from '../../../hooks/usePublisherContext';
import RightPanelTitle from '../RightPanel/RightPanelTitle';
import EffectOptionButtons from '../../BackgroundEffects/EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../../BackgroundEffects/BackgroundGallery/BackgroundGallery';
import BackgroundVideoContainer from '../../BackgroundEffects/BackgroundVideoContainer';
import useBackgroundPublisherContext from '../../../hooks/useBackgroundPublisherContext';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '../../../utils/constants';
import AddBackgroundEffect from '../../BackgroundEffects/AddBackgroundEffect/AddBackgroundEffect';
import getInitialBackgroundFilter from '../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';

export type BackgroundEffectsLayoutProps = {
  handleClose: () => void;
  isOpen: boolean;
};

/**
 * BackgroundEffectsLayout Component
 *
 * This component manages the UI for background effects (cancel background and blurs) in a room.
 * @param {BackgroundEffectsLayoutProps} props - The props for the component.
 *   @property {boolean} isOpen - Whether the background effects panel is open.
 *   @property {Function} handleClose - Function to close the panel.
 * @returns {ReactElement} The background effects panel component.
 */
const BackgroundEffectsLayout = ({
  handleClose,
  isOpen,
}: BackgroundEffectsLayoutProps): ReactElement | false => {
  const [backgroundSelected, setBackgroundSelected] = useState<string>('none');
  const { publisher, changeBackground, isVideoEnabled } = usePublisherContext();
  const { publisherVideoElement, changeBackground: changeBackgroundPreview } =
    useBackgroundPublisherContext();

  const handleBackgroundSelect = (selectedBackgroundOption: string) => {
    setBackgroundSelected(selectedBackgroundOption);
    changeBackgroundPreview(selectedBackgroundOption);
  };

  const handleApplyBackgroundSelect = async () => {
    changeBackground(backgroundSelected);
    handleClose();
  };

  const setInitialBackgroundReplacement = useCallback(() => {
    const selectedBackgroundOption = getInitialBackgroundFilter(publisher);
    setBackgroundSelected(selectedBackgroundOption);
    return selectedBackgroundOption;
  }, [publisher, setBackgroundSelected]);

  const publisherVideoFilter = publisher?.getVideoFilter();

  // Reset background when closing the panel
  useEffect(() => {
    if (isOpen) {
      const currentOption = setInitialBackgroundReplacement();
      changeBackgroundPreview(currentOption);
    }
  }, [publisherVideoFilter, isOpen, changeBackgroundPreview, setInitialBackgroundReplacement]);

  return (
    isOpen && (
      <>
        <RightPanelTitle title={t('backgroundEffects.title')} handleClose={handleClose} />

        <Box sx={{ ml: 1.5, mr: 1.5 }}>
          <BackgroundVideoContainer
            publisherVideoElement={publisherVideoElement}
            isParentVideoEnabled={isVideoEnabled}
          />
        </Box>

        <Box className="choose-background-effect-box" sx={{ m: 1.5 }}>
          <Typography variant="subtitle2" sx={{ textAlign: 'left', mb: 1 }}>
            {t('backgroundEffects.choice')}
          </Typography>

          <Box
            display="grid"
            gridTemplateColumns={`repeat(auto-fill, minmax(${DEFAULT_SELECTABLE_OPTION_WIDTH}px, 1fr))`}
            gap={1}
            sx={{
              overflowY: 'auto',
              maxHeight: '400px',
            }}
          >
            <EffectOptionButtons
              backgroundSelected={backgroundSelected}
              setBackgroundSelected={handleBackgroundSelect}
            />
            <AddBackgroundEffect />
            {/* TODO: load custom images */}
            <BackgroundGallery
              backgroundSelected={backgroundSelected}
              setBackgroundSelected={handleBackgroundSelect}
            />
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" m={1.5}>
          <Button
            data-testid="background-effect-cancel-button"
            variant="outlined"
            color="primary"
            sx={{ width: '100%', mr: 1 }}
            onClick={handleClose}
          >
            {t('button.cancel')}
          </Button>
          <Button
            data-testid="background-effect-apply-button"
            variant="contained"
            color="primary"
            sx={{ width: '100%' }}
            onClick={handleApplyBackgroundSelect}
          >
            {t('button.apply')}
          </Button>
        </Box>
      </>
    )
  );
};

export default BackgroundEffectsLayout;
