import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import usePublisherContext from '../../../hooks/usePublisherContext';
import RightPanelTitle from '../RightPanel/RightPanelTitle';
import { setStorageItem, STORAGE_KEYS } from '../../../utils/storage';
import { BACKGROUNDS_PATH } from '../../../utils/constants';
import EffectOptionButtons from '../../BackgroundEffects/EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../../BackgroundEffects/BackgroundGallery/BackgroundGallery';

export type BackgroundEffectsProps = {
  handleClose: () => void;
  isOpen: boolean;
  fromPreview?: boolean;
};

/**
 * BackgroundEffects Component
 *
 * This component manages the UI for background effects in the meeting room.
 * @param {BackgroundEffectsProps} props - The props for the component.
 *   @property {boolean} isOpen - Whether the background effects panel is open.
 *   @property {Function} handleClose - Function to close the panel.
 *   @property {boolean} fromPreview - Optional flag to indicate if the component is used in preview mode.
 * @returns {ReactElement} The background effects panel component.
 */
const BackgroundEffects = ({
  handleClose,
  isOpen,
  fromPreview = false,
}: BackgroundEffectsProps): ReactElement | false => {
  const [backgroundSelected, setBackgroundSelected] = useState('none');
  const { publisher } = usePublisherContext();

  const handleBackgroundSelect = async () => {
    setBackgroundSelected(backgroundSelected);
    setStorageItem(STORAGE_KEYS.BACKGROUND_REPLACEMENT, JSON.stringify(backgroundSelected));

    if (backgroundSelected === 'low-blur' || backgroundSelected === 'high-blur') {
      await publisher?.applyVideoFilter({
        type: 'backgroundBlur',
        blurStrength: backgroundSelected === 'low-blur' ? 'low' : 'high',
      });
    } else if (/\.(jpg|jpeg|png|gif|bmp)$/i.test(backgroundSelected)) {
      // If the key is an image filename, apply background replacement
      await publisher?.applyVideoFilter({
        type: 'backgroundReplacement',
        backgroundImgUrl: `${BACKGROUNDS_PATH}/${backgroundSelected}`,
      });
    } else {
      await publisher?.clearVideoFilter();
    }
  };

  const setInitialBackgroundReplacement = useCallback(() => {
    const videoFilter = publisher?.getVideoFilter();
    if (
      videoFilter &&
      videoFilter.type === 'backgroundBlur' &&
      videoFilter.blurStrength === 'low'
    ) {
      setBackgroundSelected('low-blur');
    } else if (
      videoFilter &&
      videoFilter.type === 'backgroundBlur' &&
      videoFilter.blurStrength === 'high'
    ) {
      setBackgroundSelected('high-blur');
    } else if (videoFilter && videoFilter.type === 'backgroundReplacement') {
      setBackgroundSelected(videoFilter.backgroundImgUrl?.split('/').pop() || 'none');
    } else {
      setBackgroundSelected('none');
    }
  }, [publisher]);

  useEffect(() => {
    setInitialBackgroundReplacement();
  }, [publisher, setInitialBackgroundReplacement]);

  return (
    isOpen && (
      <>
        {fromPreview ? (
          <Typography variant="h6" sx={{ mb: 2 }}>
            Background Effects
          </Typography>
        ) : (
          <RightPanelTitle title="Background Effects" handleClose={handleClose} />
        )}

        <Box
          sx={{
            m: 1.5,
            border: 1,
            borderColor: 'grey.300',
            borderRadius: 4,
            p: 2,
            pb: 0.5,
            backgroundColor: '#F0F4F9',
          }}
        >
          <Typography variant="subtitle2" sx={{ textAlign: 'left', mb: 1 }}>
            Choose Background Effect
          </Typography>

          <EffectOptionButtons
            backgroundSelected={backgroundSelected}
            setBackgroundSelected={setBackgroundSelected}
          />

          <BackgroundGallery
            backgroundSelected={backgroundSelected}
            setBackgroundSelected={setBackgroundSelected}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" m={1.5}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ width: '100%', mr: 1 }}
            onClick={setInitialBackgroundReplacement}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ width: '100%' }}
            onClick={handleBackgroundSelect}
          >
            Apply
          </Button>
        </Box>
      </>
    )
  );
};

export default BackgroundEffects;
