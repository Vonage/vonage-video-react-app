import { ReactElement } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@ui/theme';

export type NameDisplayProps = {
  containerWidth: number;
  name: string;
};

/**
 * NameDisplay Component
 *
 * This component shows a truncated name within a specified container width.
 * @param {NameDisplayProps} props - the props for the component.
 *  @property {number} containerWidth - the width of the container to determine the max width for truncation.
 *  @property {string} name - the name to be displayed.
 * @returns {ReactElement} The NameDisplay component.
 */
const NameDisplay = ({ name, containerWidth }: NameDisplayProps): ReactElement => {
  const theme = useTheme();
  const safeMaxWidth =
    typeof containerWidth === 'number' && Number.isFinite(containerWidth) ? containerWidth : 0;
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: theme.colors.accent,
        maxWidth: Math.max(0, safeMaxWidth - 32),
      }}
    >
      <Typography variant="body1" component="span">
        {name}
      </Typography>
    </Box>
  );
};

export default NameDisplay;
