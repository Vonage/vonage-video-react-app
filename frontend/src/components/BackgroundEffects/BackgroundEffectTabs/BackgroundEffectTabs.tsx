import { Box, Tabs, Tab } from '@mui/material';
import { Publisher } from '@vonage/client-sdk-video';
import { ReactElement } from 'react';
import EffectOptionButtons from '../EffectOptionButtons/EffectOptionButtons';
import BackgroundGallery from '../BackgroundGallery/BackgroundGallery';
import AddBackgroundEffectLayout from '../AddBackgroundEffect/AddBackgroundEffectLayout/AddBackgroundEffectLayout';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '../../../utils/constants';
import getInitialBackgroundFilter from '../../../utils/backgroundFilter/getInitialBackgroundFilter/getInitialBackgroundFilter';
import useIsTabletViewport from '../../../hooks/useIsTabletViewport';

type BackgroundEffectTabsProps = {
  tabSelected: number;
  setTabSelected: (value: number) => void;
  mode: 'meeting' | 'waiting';
  backgroundSelected: string;
  setBackgroundSelected: (value: string) => void;
  cleanupSelectedBackgroundReplacement: (dataUrl: string) => void;
  customBackgroundImageChange: (dataUrl: string) => void;
};

export const clearBgWhenSelectedDeleted = (
  publisher: Publisher | null | undefined,
  changeBackground: (bg: string) => void,
  backgroundSelected: string,
  dataUrl: string
) => {
  const selectedBackgroundOption = getInitialBackgroundFilter(publisher);
  if (dataUrl === selectedBackgroundOption) {
    changeBackground(backgroundSelected);
  }
};

/**
 * BackgroundEffectTabs Component
 *
 * This component manages the tabs for background effects, including selecting existing backgrounds
 * and adding new ones.
 * @param {BackgroundEffectTabsProps} props - The props for the component.
 *   @property {number} tabSelected - The currently selected tab index.
 *   @property {Function} setTabSelected - Function to set the selected tab index.
 *   @property {string} mode - The mode of the background effect ('meeting' or 'waiting').
 *   @property {string} backgroundSelected - The currently selected background option.
 *   @property {Function} setBackgroundSelected - Function to set the selected background option.
 *   @property {Function} cleanupSelectedBackgroundReplacement - Function to clean up background replacement if deleted.
 *   @property {Function} customBackgroundImageChange - Callback function to handle background image change.
 * @returns {ReactElement} The background effect tabs component.
 */
const BackgroundEffectTabs = ({
  tabSelected,
  setTabSelected,
  mode,
  backgroundSelected,
  setBackgroundSelected,
  cleanupSelectedBackgroundReplacement,
  customBackgroundImageChange,
}: BackgroundEffectTabsProps): ReactElement => {
  const handleBackgroundSelect = (value: string) => {
    setBackgroundSelected(value);
  };
  const isTabletViewport = useIsTabletViewport();

  return (
    <Box
      sx={{
        display: 'block',
        flex: 1,
        minWidth: 0,
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        minHeight: isTabletViewport || mode === 'meeting' ? 'auto' : '400px',
      }}
    >
      <Tabs
        variant="fullWidth"
        sx={{
          padding: '0 6px 12px 6px',
          '& .MuiTabs-flexContainer': {
            borderBottom: '1px solid #ccc',
          },
        }}
        value={tabSelected}
        onChange={(_event, newValue) => setTabSelected(newValue)}
        aria-label="backgrounds tabs"
      >
        <Tab sx={{ textTransform: 'none' }} label="Backgrounds" />
        <Tab sx={{ textTransform: 'none' }} label="Add Background" />
      </Tabs>

      <Box className="choose-background-effect-box" flex={1} minWidth={0}>
        {tabSelected === 0 && (
          <Box
            display="grid"
            gridTemplateColumns={`repeat(auto-fill, minmax(${DEFAULT_SELECTABLE_OPTION_WIDTH}px, 1fr))`}
            gap={0.5}
            className={
              mode === 'meeting'
                ? 'choose-background-effect-grid'
                : 'choose-background-effect-grid-waiting'
            }
          >
            <EffectOptionButtons
              backgroundSelected={backgroundSelected}
              setBackgroundSelected={handleBackgroundSelect}
            />
            <BackgroundGallery
              backgroundSelected={backgroundSelected}
              setBackgroundSelected={handleBackgroundSelect}
              clearPublisherBgIfSelectedDeleted={cleanupSelectedBackgroundReplacement}
            />
          </Box>
        )}
        {tabSelected === 1 && (
          <AddBackgroundEffectLayout customBackgroundImageChange={customBackgroundImageChange} />
        )}
      </Box>
    </Box>
  );
};

export default BackgroundEffectTabs;
