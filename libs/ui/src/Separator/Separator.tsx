import classNames from 'classnames';
import type { CSSProperties, HTMLAttributes, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

export type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  width?: CSSProperties['width'];
};

const Separator = ({
  className,
  style,
  width = '50%',
  ...separatorProps
}: SeparatorProps): ReactElement => {
  return (
    <div
      className={twMerge(classNames('border-vera-border w-full border-b', className))}
      data-testid="separator"
      style={{ width, ...style }}
      {...separatorProps}
    />
  );
};

export default Separator;
