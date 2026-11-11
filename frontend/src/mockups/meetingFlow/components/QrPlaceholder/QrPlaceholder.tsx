import type { ComponentProps, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';
import isQrModuleFilled from './helpers/isQrModuleFilled';

const QR_SIZE = 21;
const moduleIndexes = Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => index);

export type QrPlaceholderProps = ComponentProps<'div'> & {
  seed: string;
  label: string;
};

/**
 * Stand-in for a real QR code: a deterministic 21×21 pattern with the three finder squares.
 */
const QrPlaceholder = ({ seed, label, className, ...props }: QrPlaceholderProps): ReactElement => {
  return (
    <div
      role="img"
      aria-label={label}
      className={twMerge('aspect-square rounded-vera-small bg-vera-accent p-2', className)}
      {...props}
    >
      <div className="grid size-full grid-cols-21 grid-rows-21">
        {moduleIndexes.map((index) => {
          const isFilled = isQrModuleFilled({
            row: Math.floor(index / QR_SIZE),
            column: index % QR_SIZE,
            size: QR_SIZE,
            seed,
          });

          return <span key={index} className={isFilled ? 'bg-vera-on-accent' : undefined} />;
        })}
      </div>
    </div>
  );
};

export default QrPlaceholder;
