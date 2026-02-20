import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VividIcon from '@components/VividIcon';
import useTheme from '@ui/theme';
import { BACKGROUNDS_PATH } from '@utils/constants';
import SelectableOption from '../SelectableOption';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';

/**
 * Renders a group of selectable images for background replacement in a meeting room.
 *
 * Each button represents a different background image option.
 * @returns {ReactElement} A horizontal stack of selectable option buttons.
 */
const BackgroundGallery = (): ReactElement => {
  const { backgroundSelected, handleBackgroundChange, customImages, deleteCustomImage } =
    useBackgroundPublisherContext();
  const { t } = useTranslation();
  const theme = useTheme();

  const backgrounds = [
    {
      id: 'bg1',
      file: 'bookshelf-room.jpg',
      name: t('backgroundEffects.backgrounds.bookshelfRoom'),
    },
    { id: 'bg2', file: 'busy-room.jpg', name: t('backgroundEffects.backgrounds.busyRoom') },
    { id: 'bg3', file: 'dune-view.jpg', name: t('backgroundEffects.backgrounds.duneView') },
    { id: 'bg4', file: 'hogwarts.jpg', name: t('backgroundEffects.backgrounds.hogwarts') },
    { id: 'bg5', file: 'library.jpg', name: t('backgroundEffects.backgrounds.library') },
    { id: 'bg6', file: 'new-york.jpg', name: t('backgroundEffects.backgrounds.newYork') },
    { id: 'bg7', file: 'plane.jpg', name: t('backgroundEffects.backgrounds.plane') },
    { id: 'bg8', file: 'white-room.jpg', name: t('backgroundEffects.backgrounds.whiteRoom') },
  ];

  return (
    <>
      {customImages.map(({ id, dataUrl }) => {
        const isSelected = backgroundSelected === dataUrl;
        return (
          <Box
            key={id}
            sx={{
              position: 'relative',
              display: 'inline-block',
            }}
          >
            <SelectableOption
              id={id}
              title={t('backgroundEffects.yourBackground')}
              isSelected={isSelected}
              onClick={() => handleBackgroundChange(dataUrl)}
              image={dataUrl}
            >
              <Tooltip
                title={
                  isSelected
                    ? t('backgroundEffects.deleteTooltipInUse')
                    : t('backgroundEffects.deleteTooltip')
                }
                arrow
              >
                <IconButton
                  data-testid={`background-delete-${id}`}
                  aria-label={t('backgroundEffects.deleteAriaLabel')}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      deleteCustomImage(id);
                    }
                  }}
                  size="small"
                  sx={{
                    color: isSelected ? theme.colors.textDisabled : theme.colors.background,
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    zIndex: 10,
                    cursor: isSelected ? 'default' : 'pointer',
                    backgroundColor: isSelected ? theme.colors.disabled : theme.colors.onBackground,
                    '&:hover': {
                      backgroundColor: isSelected ? theme.colors.disabled : theme.colors.background,
                    },
                  }}
                >
                  <VividIcon name="delete-solid" customSize={-6} />
                </IconButton>
              </Tooltip>
            </SelectableOption>
          </Box>
        );
      })}

      {backgrounds.map((bg) => {
        const path = `${BACKGROUNDS_PATH}/${bg.file}`;
        return (
          <SelectableOption
            key={bg.id}
            title={bg.name}
            id={bg.id}
            isSelected={backgroundSelected === bg.file}
            onClick={() => handleBackgroundChange(bg.file)}
            image={path}
          />
        );
      })}
    </>
  );
};

export default BackgroundGallery;
