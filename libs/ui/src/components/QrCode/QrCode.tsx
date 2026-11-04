import { useMemo, type ComponentProps, type ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';
import { encode } from 'uqr';

export type QrCodeProps = ComponentProps<'svg'> & {
  value: string;
};

/**
 * Renders `value` as a QR code in an inline SVG, dark modules on a light background.
 */
const QrCode = ({ value, className, ...props }: QrCodeProps): ReactElement => {
  const { size, data } = useMemo(() => encode(value, { border: 2 }), [value]);

  const modulesPath = useMemo(
    () =>
      data
        .flatMap((row, rowIndex) =>
          row.map((isDark, columnIndex) => (isDark ? `M${columnIndex} ${rowIndex}h1v1h-1z` : ''))
        )
        .join(''),
    [data]
  );

  return (
    <svg
      role="img"
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      className={twMerge('aspect-square bg-vera-accent text-vera-on-accent', className)}
      {...props}
    >
      <path d={modulesPath} fill="currentColor" />
    </svg>
  );
};

export default QrCode;
