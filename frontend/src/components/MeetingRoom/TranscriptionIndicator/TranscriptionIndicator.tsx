import Box from '@mui/material/Box';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import VividIcon from '@ui/components/VividIcon';

export type TranscriptionIndicatorProps = {
  isCompact?: boolean;
};

const TranscriptionIndicator = ({
  isCompact = false,
}: TranscriptionIndicatorProps): ReactElement => {
  return (
    <Box
      aria-hidden
      data-testid="transcriptionIndicator"
      className={classNames('shrink-0 flex items-center justify-center', {
        'h-4 w-4': isCompact,
        'h-4.75 w-4.75': !isCompact,
      })}
    >
      <VividIcon
        name="text-line"
        customSize={-6}
        className="text-vera-error"
        data-testid="transcriptionIndicatorIcon"
      />
    </Box>
  );
};

export default TranscriptionIndicator;
