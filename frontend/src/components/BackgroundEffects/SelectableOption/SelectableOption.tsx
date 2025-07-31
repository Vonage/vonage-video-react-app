import React from 'react';
import { Paper } from '@mui/material';
import { DEFAULT_SELECTABLE_OPTION_WIDTH } from '../../../utils/constants';

interface SelectableOptionProps {
  selected: boolean;
  onClick: () => void;
  id: string;
  icon?: React.ReactNode;
  image?: string;
  size?: number;
  isDisabled?: boolean;
}

/**
 * Renders a selectable option with an icon or image.
 *
 * The option can be selected or disabled, and has a hover effect.
 * @param {SelectableOptionProps} props - The properties for the component
 *  @property {boolean} selected - Whether the option is selected
 *  @property {Function} onClick - Function to call when the option is clicked
 *  @property {string} id - Unique identifier for the option
 *  @property {React.ReactNode} icon - Icon to display in the option
 *  @property {string} image - Image URL to display in the option
 *  @property {number} size - Size of the option (default is DEFAULT_SELECTABLE_OPTION_WIDTH)
 *  @property {boolean} isDisabled - Whether the option is disabled
 * @returns {React.ReactElement} A selectable option element
 */
const SelectableOption: React.FC<SelectableOptionProps> = ({
  selected,
  onClick,
  id,
  icon,
  image,
  size = DEFAULT_SELECTABLE_OPTION_WIDTH,
  isDisabled = false,
  ...otherProps // Used by MUI Tooltip
}) => {
  return (
    <Paper
      data-testid={`background-${id}`}
      onClick={onClick}
      elevation={selected ? 4 : 1}
      aria-disabled={isDisabled}
      aria-pressed={selected}
      sx={{
        width: size,
        height: size,
        overflow: 'hidden',
        borderRadius: '16px',
        border: selected ? '2px solid #1976d2' : '',
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
          alt="background"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        icon
      )}
    </Paper>
  );
};

export default SelectableOption;
