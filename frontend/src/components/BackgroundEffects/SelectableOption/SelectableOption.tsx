import { ReactElement, ReactNode } from 'react';
import { Box, Paper, Tooltip } from '@mui/material';
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
 * @property {ReactNode} children - Additional content to render inside the option
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
  isDisabled = false,
  children,
  ...otherProps // Used by MUI Tooltip
}: SelectableOptionProps): ReactElement => {
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
      <Tooltip title={title} aria-label={title}>
        <Paper
          data-testid={`background-${id}`}
          onClick={onClick}
          elevation={isSelected ? 4 : 1}
          aria-disabled={isDisabled}
          aria-pressed={isSelected}
          sx={{
            width: size,
            height: size,
            overflow: 'hidden',
            borderRadius: '16px',
            border: isSelected ? '2px solid #1976d2' : '',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.1s ease-in-out',
            backgroundColor: isDisabled ? '#f5f5f5' : '#fff',
            opacity: isDisabled ? 0.5 : 1,
          }}
          {...otherProps}
        >
          {image ? (
            <img
              src={image}
              title={title}
              alt="background"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            icon
          )}
          {children}
        </Paper>
      </Tooltip>
    </Box>
  );
};

export default SelectableOption;
