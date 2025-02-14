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
  return (
    <div
      className={`absolute bottom-[10px] left-[10px] truncate text-sm text-white ${TEXT_SHADOW}`}
      style={{
        maxWidth: containerWidth - 32,
      }}
    >
      <span>{name}</span>
    </div>
  );
};

export default NameDisplay;
