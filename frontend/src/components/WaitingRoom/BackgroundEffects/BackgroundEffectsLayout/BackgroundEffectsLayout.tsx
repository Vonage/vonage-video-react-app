import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, Typography, useMediaQuery } from '@mui/material';
import EffectOptionButtons from '../../../BackgroundEffects/EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../../../BackgroundEffects/BackgroundGallery/BackgroundGallery';
import BackgroundVideoContainer from '../../../BackgroundEffects/BackgroundVideoContainer';
import usePreviewPublisherContext from '../../../../hooks/usePreviewPublisherContext';
import useBackgroundPublisherContext from '../../../../hooks/useBackgroundPublisherContext';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '../../../../utils/constants';
import AddBackgroundEffect from '../../../BackgroundEffects/AddBackgroundEffect/AddBackgroundEffect';

export type BackgroundEffectsProps = {
  isOpen: boolean;
  handleClose: () => void;
};

/**
 * BackgroundEffects Component
 *
 * This component manages the UI for background effects in the waiting room.
 * @param {BackgroundEffectsProps} props - The props for the component.
 *   @property {boolean} isOpen - Whether the background effects panel is open.
 * @returns {ReactElement} The background effects panel component.
 */
const BackgroundEffects = ({
  isOpen,
  handleClose,
}: BackgroundEffectsProps): ReactElement | false => {
  const [backgroundSelected, setBackgroundSelected] = useState('none');
  const { publisher, changeBackground, isVideoEnabled } = usePreviewPublisherContext();
  const { publisherVideoElement, changeBackground: changeBackgroundPreview } =
    useBackgroundPublisherContext();
  const isTabletViewport = useMediaQuery(`(max-width:899px)`);

  const handleBackgroundSelect = (selectedBackgroundOption: string) => {
    setBackgroundSelected(selectedBackgroundOption);
    changeBackgroundPreview(selectedBackgroundOption);
  };

  const handleApplyBackgroundSelect = () => {
    changeBackground(backgroundSelected);
  };

  const setInitialBackgroundReplacement = useCallback(() => {
    const videoFilter = publisher?.getVideoFilter();
    let selectedBackgroundOption = 'none';
    if (
      videoFilter &&
      videoFilter.type === 'backgroundBlur' &&
      videoFilter.blurStrength === 'low'
    ) {
      selectedBackgroundOption = 'low-blur';
    } else if (
      videoFilter &&
      videoFilter.type === 'backgroundBlur' &&
      videoFilter.blurStrength === 'high'
    ) {
      selectedBackgroundOption = 'high-blur';
    } else if (videoFilter && videoFilter.type === 'backgroundReplacement') {
      selectedBackgroundOption = videoFilter.backgroundImgUrl?.split('/').pop() || 'none';
    }

    setBackgroundSelected(selectedBackgroundOption);
    return selectedBackgroundOption;
  }, [publisher, setBackgroundSelected]);

  // Reset background when closing the panel
  useEffect(() => {
    if (isOpen) {
      const currentOption = setInitialBackgroundReplacement();
      changeBackgroundPreview(currentOption);
    }
  }, [publisher, isOpen, changeBackgroundPreview, setInitialBackgroundReplacement]);

  const buttonGroup = (
    <Box display="flex" justifyContent="space-between" mt={1.5}>
      <Button
        variant="outlined"
        color="primary"
        sx={{ width: '100%', mr: 1 }}
        onClick={() => {
          const currentOption = setInitialBackgroundReplacement();
          changeBackgroundPreview(currentOption);
          handleClose();
        }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="primary"
        sx={{ width: '100%' }}
        onClick={() => {
          handleApplyBackgroundSelect();
          handleClose();
        }}
      >
        Apply
      </Button>
    </Box>
  );

  return (
    isOpen && (
      <>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Background Effects
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1} minWidth={0}>
            <BackgroundVideoContainer
              publisherVideoElement={publisherVideoElement}
              isParentVideoEnabled={isVideoEnabled}
              fixedWidth
            />
            {!isTabletViewport && buttonGroup}
          </Box>

          <Box flex={1} minWidth={0} className="choose-background-effect-box">
            <Typography variant="subtitle2" sx={{ textAlign: 'left', mb: 1 }}>
              Choose Background Effect
            </Typography>
            <Box
              display="grid"
              gridTemplateColumns={`repeat(auto-fill, minmax(${DEFAULT_SELECTABLE_OPTION_WIDTH}px, 1fr))`}
              gap={1}
              sx={{
                overflowY: 'auto',
                maxHeight: '375px',
              }}
            >
              <EffectOptionButtons
                backgroundSelected={backgroundSelected}
                setBackgroundSelected={handleBackgroundSelect}
              />
              <AddBackgroundEffect
                backgroundSelected={backgroundSelected}
                setBackgroundSelected={handleBackgroundSelect}
              />
              {/* TODO: load custom images */}
              <BackgroundGallery
                backgroundSelected={backgroundSelected}
                setBackgroundSelected={handleBackgroundSelect}
              />
            </Box>
          </Box>
          {isTabletViewport && buttonGroup}
        </Box>
      </>
    )
  );
};

export default BackgroundEffects;
