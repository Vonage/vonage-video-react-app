import type { ReactElement } from 'react';

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
    <div
      className="absolute bottom-1 left-2.5 overflow-hidden text-ellipsis whitespace-nowrap bg-vera-dark-grey-opacity text-vera-accent rounded-vera-medium px-2 py-1"
      style={{
        maxWidth: Math.max(0, safeMaxWidth - 32),
      }}
    >
      <span className="font-vera-plain text-vera-body-base">{name}</span>
    </div>
  );
};

export default NameDisplay;
