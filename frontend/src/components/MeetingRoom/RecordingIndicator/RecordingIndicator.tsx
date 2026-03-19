import Box from '@mui/material/Box';
import classNames from 'classnames';
import type { ReactElement } from 'react';

export type RecordingIndicatorProps = {
  isCompact?: boolean;
};

const RecordingIndicator = ({ isCompact = false }: RecordingIndicatorProps): ReactElement => {
  const indicatorClassName = classNames('relative shrink-0', {
    'h-4 w-4': isCompact,
    'h-[19px] w-[19px]': !isCompact,
  });

  const dotClassName = classNames(
    'absolute rounded-full bg-vera-error shadow-[0_0_0_1px_rgba(0,0,0,0.25)]',
    {
      'inset-1': isCompact,
      'inset-[5px]': !isCompact,
    }
  );

  return (
    <Box aria-hidden data-testid="recordingIndicator" className={indicatorClassName}>
      <Box
        data-testid="recordingIndicatorPulse"
        className="absolute inset-0 scale-[0.85] rounded-full bg-vera-error opacity-30 animate-ping [animation-duration:2s]"
      />
      <Box data-testid="recordingIndicatorDot" className={dotClassName} />
    </Box>
  );
};

export default RecordingIndicator;
