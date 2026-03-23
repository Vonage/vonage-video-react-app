import Box from '@mui/material/Box';
import classNames from 'classnames';
import type { ReactElement } from 'react';

export type RecordingIndicatorProps = {
  isCompact?: boolean;
};

const RecordingIndicator = ({ isCompact = false }: RecordingIndicatorProps): ReactElement => {
  return (
    <Box
      aria-hidden
      data-testid="recordingIndicator"
      className={classNames('relative shrink-0', {
        'h-4 w-4': isCompact,
        'h-4.75 w-4.75': !isCompact,
      })}
    >
      <Box
        data-testid="recordingIndicatorPulse"
        className={classNames(
          'absolute inset-0 m-auto rounded-full bg-vera-error opacity-30 animate-ping [animation-duration:2s]',
          {
            'h-3.5 w-3.5': isCompact,
            'h-4 w-4': !isCompact,
          }
        )}
      />
      <Box
        data-testid="recordingIndicatorDot"
        className={classNames(
          'absolute rounded-full bg-vera-error shadow-[0_0_0_1px_rgba(0,0,0,0.25)]',
          {
            'inset-1': isCompact,
            'inset-1.25': !isCompact,
          }
        )}
      />
    </Box>
  );
};

export default RecordingIndicator;
