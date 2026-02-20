import { ReactElement, ReactNode } from 'react';
import useTheme from '@ui/theme';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '../../../utils/constants';

export type SelectableOptionProps = {
  isSelected: boolean;
  onClick: () => void;
  id: string;
  icon?: ReactNode;
  title?: string;
  image?: string;
  size?: number;
  isDisabled?: boolean;
  children?: ReactNode;
};

/**
 * Renders a selectable option with an icon or image.
 *
 * The option can be selected or disabled, and has a hover effect.
 * @param {SelectableOptionProps} props - The properties for the component
 *  @property {boolean} isSelected - Whether the option is selected
 *  @property {Function} onClick - Function to call when the option is clicked
 *  @property {string} id - Unique identifier for the option
 *  @property {ReactNode} icon - Icon to display in the option
 *  @property {string} title - Title to display in the option
 *  @property {string} image - Image URL to display in the option
 *  @property {number} size - Size of the option (default is DEFAULT_SELECTABLE_OPTION_WIDTH)
 *  @property {boolean} isDisabled - Whether the option is disabled
 *  @property {ReactNode} children - Additional content to render inside the option
 * @returns {ReactElement} A selectable option element
 */
const SelectableOption = ({
  isSelected,
  onClick,
  id,
  icon,
  title,
  image,
  size = DEFAULT_SELECTABLE_OPTION_WIDTH,
  children,
  ...otherProps
}: SelectableOptionProps): ReactElement => {
  const theme = useTheme();

  return (
    <Box
      key={id}
      sx={{
        position: 'relative',
        display: 'inline-block',
        mb: 1,
        mr: 1,
      }}
    >
      <Box
        data-testid={`background-${id}`}
        onClick={onClick}
        aria-pressed={isSelected}
        sx={{
          width: size,
          height: size,
          overflow: 'hidden',
          borderRadius: theme.shapes.borderRadiusMedium,
          border: isSelected
            ? `1.5px solid ${theme.colors.primary}`
            : `1px solid ${theme.colors.border}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.secondary,
          backgroundColor: isSelected ? theme.colors.background : theme.colors.surface,
          opacity: 1,
        }}
        {...otherProps}
      >
        <Tooltip arrow title={title} aria-label={title}>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {image ? (
              <img
                src={image}
                title={title}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              icon
            )}
          </Box>
        </Tooltip>
        {children}
      </Box>
    </Box>
  );
};

export default SelectableOption;
