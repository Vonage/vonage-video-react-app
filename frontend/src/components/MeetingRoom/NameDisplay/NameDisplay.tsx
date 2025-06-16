import { ReactElement } from 'react';
import { TEXT_SHADOW } from '../../../utils/constants';

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
      className={`absolute bottom-[10px] left-[10px] truncate text-sm text-white ${TEXT_SHADOW}`}
      style={{
        maxWidth: Math.max(0, safeMaxWidth - 32),
      }}
    >
      <span>{name}</span>
    </div>
  );
};

export default NameDisplay;
