import { ReactElement } from 'react';
import Box from '@ui/Box';
import Typography from '@ui/Typography';

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
  const safeMaxWidth =
    typeof containerWidth === 'number' && Number.isFinite(containerWidth) ? containerWidth : 0;
  return (
    <Box
      className="absolute bottom-2.5 left-2.5 overflow-hidden text-ellipsis whitespace-nowrap bg-vera-dark-grey-opacity text-vera-accent rounded-vera-medium px-2 py-1"
      style={{
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
