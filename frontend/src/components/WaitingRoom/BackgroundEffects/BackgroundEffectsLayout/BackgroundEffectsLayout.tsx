import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import EffectOptionButtons from '../../../BackgroundEffects/EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../../../BackgroundEffects/BackgroundGallery/BackgroundGallery';
import BackgroundVideoContainer from '../../../BackgroundEffects/BackgroundVideoContainer';
import usePreviewPublisherContext from '../../../../hooks/usePreviewPublisherContext';
import useBackgroundPublisherContext from '../../../../hooks/useBackgroundPublisherContext';

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
  const { publisher, changeBackground } = usePreviewPublisherContext();
  const { publisherVideoElement, changeBackground: changeBackgroundPreview } =
    useBackgroundPublisherContext();

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

  return (
    isOpen && (
      <>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Background Effects
        </Typography>

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Box flex={1} minWidth={0}>
            <BackgroundVideoContainer publisherVideoElement={publisherVideoElement} fixedWidth />
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
          </Box>

          <Box flex={1} minWidth={0} className="choose-background-effect-box">
            <Typography variant="subtitle2" sx={{ textAlign: 'left', mb: 1 }}>
              Choose Background Effect
            </Typography>
            <EffectOptionButtons
              backgroundSelected={backgroundSelected}
              setBackgroundSelected={handleBackgroundSelect}
            />
            <BackgroundGallery
              backgroundSelected={backgroundSelected}
              setBackgroundSelected={handleBackgroundSelect}
            />
          </Box>
        </Box>
      </>
    )
  );
};

export default BackgroundEffects;
