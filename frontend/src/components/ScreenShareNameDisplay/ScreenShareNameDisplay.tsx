import type { Box } from 'opentok-layout-js';
import type { ReactElement } from 'react';

export type ScreenShareNameDisplayProps = {
  name: string;
  box: Box;
};

/**
 * ScreenShareNameDisplay Component
 *
 * Displays the name of who's screen-sharing along with an identifier that it's a screen video tile.
 * @param {ScreenShareNameDisplayProps} props - The props for the component.
 * @returns {ReactElement} The ScreenShareNameDisplay component.
 */
const ScreenShareNameDisplay = ({ name, box }: ScreenShareNameDisplayProps): ReactElement => {
  const safeMaxWidth = typeof box.width === 'number' && Number.isFinite(box.width) ? box.width : 0;

  return (
    <div
      className="absolute bottom-1 left-1.5 overflow-hidden whitespace-nowrap rounded-vera-medium bg-vera-dark-grey-opacity px-2 py-1 text-ellipsis text-vera-accent"
      style={{
        maxWidth: Math.max(0, safeMaxWidth - 32),
        marginBottom: '4px',
      }}
    >
      <span className="font-vera-plain text-vera-body-base">{name}</span>
    </div>
  );
};

export default ScreenShareNameDisplay;
