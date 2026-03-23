import classNames from 'classnames';
import type { CSSProperties, HTMLAttributes, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';

export type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: 'left' | 'right';
  width?: CSSProperties['width'];
};

const Separator = ({
  className,
  orientation = 'left',
  style,
  width = '50%',
  ...separatorProps
}: SeparatorProps): ReactElement => {
  return (
    <div
      className={twMerge(
        classNames(
          'border-vera-border w-full border-b',
          {
            'mr-2': orientation === 'left',
            'ml-2': orientation === 'right',
          },
          className
        )
      )}
      data-testid="separator"
      style={{ ...style, width }}
      {...separatorProps}
    />
  );
};

export default Separator;
