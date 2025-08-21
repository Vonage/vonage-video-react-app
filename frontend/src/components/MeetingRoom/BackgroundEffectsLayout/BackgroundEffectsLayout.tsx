import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Box, Button, useMediaQuery } from '@mui/material';
import usePublisherContext from '../../../hooks/usePublisherContext';
import RightPanelTitle from '../RightPanel/RightPanelTitle';
import BackgroundVideoContainer from '../../BackgroundEffects/BackgroundVideoContainer';
import useBackgroundPublisherContext from '../../../hooks/useBackgroundPublisherContext';
import getInitialBackgroundFilter from '../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';
import BackgroundEffectTabs, {
  cleanBackgroundReplacementIfSelectedAndDeleted,
} from '../../BackgroundEffects/BackgroundEffectTabs/BackgroundEffectTabs';

export type BackgroundEffectsLayoutProps = {
  handleClose: () => void;
  isOpen: boolean;
};

/**
 * BackgroundEffectsLayout Component
 *
 * This component manages the UI for background effects in the waiting room.
 * @param {BackgroundEffectsLayoutProps} props - The props for the component.
 *   @property {boolean} isOpen - Whether the background effects panel is open.
 *   @property {Function} handleClose - Function to close the panel.
 * @returns {ReactElement} The background effects panel component.
 */
const BackgroundEffectsLayout = ({
  handleClose,
  isOpen,
}: BackgroundEffectsLayoutProps): ReactElement | false => {
  const [tabSelected, setTabSelected] = useState<number>(0);
  const [backgroundSelected, setBackgroundSelected] = useState<string>('none');
  const isShortScreen = useMediaQuery('(max-height:825px)');
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

  const customBackgroundImageChange = (dataUrl: string) => {
    setTabSelected(0);
    handleBackgroundSelect(dataUrl);
  };

  const setInitialBackgroundReplacement = useCallback(() => {
    const selectedBackgroundOption = getInitialBackgroundFilter(publisher);
    setBackgroundSelected(selectedBackgroundOption);
    return selectedBackgroundOption;
  }, [publisher, setBackgroundSelected]);

  const publisherVideoFilter = publisher?.getVideoFilter();

  useEffect(() => {
    if (isOpen) {
      const currentOption = setInitialBackgroundReplacement();
      changeBackgroundPreview(currentOption);
    }
  }, [publisherVideoFilter, isOpen, changeBackgroundPreview, setInitialBackgroundReplacement]);

  if (!isOpen) {
    return false;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: isShortScreen ? 'auto' : 'hidden',
      }}
    >
      <RightPanelTitle title="Background Effects" handleClose={handleClose} />

      <Box sx={{ flexShrink: 0, p: 1.5 }}>
        <BackgroundVideoContainer
          publisherVideoElement={publisherVideoElement}
          isParentVideoEnabled={isVideoEnabled}
        />
      </Box>

      <BackgroundEffectTabs
        tabSelected={tabSelected}
        setTabSelected={setTabSelected}
        backgroundSelected={backgroundSelected}
        setBackgroundSelected={setBackgroundSelected}
        cleanBackgroundReplacementIfSelectedAndDeletedFunction={(dataUrl: string) =>
          cleanBackgroundReplacementIfSelectedAndDeleted(
            publisher,
            changeBackground,
            backgroundSelected,
            dataUrl
          )
        }
        customBackgroundImageChange={customBackgroundImageChange}
      />

      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          m: 1.5,
        }}
      >
        <Button
          data-testid="background-effect-cancel-button"
          variant="outlined"
          color="primary"
          sx={{ width: '100%', mr: 1 }}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          data-testid="background-effect-apply-button"
          variant="contained"
          color="primary"
          sx={{ width: '100%' }}
          onClick={handleApplyBackgroundSelect}
        >
          Apply
        </Button>
      </Box>
    </Box>
  );
};

export default BackgroundEffectsLayout;
