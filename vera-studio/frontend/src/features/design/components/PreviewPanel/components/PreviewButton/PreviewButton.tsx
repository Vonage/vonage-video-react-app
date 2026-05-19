import type { ComponentProps } from 'react';

type PreviewButtonProps = ComponentProps<'button'>;

const PreviewButton = ({ children, style, className, ...props }: PreviewButtonProps) => (
  <button
    {...props}
    className={['cursor-pointer border border-transparent px-4 py-2', className ?? ''].join(' ')}
    style={{
      borderRadius: 'var(--vera-border-radius-medium)',
      fontFamily: 'var(--vera-font-family-plain)',
      fontSize: 'var(--vera-typography-body-base-font-size)',
      lineHeight: 'var(--vera-typography-body-base-line-height)',
      fontWeight: 'var(--vera-typography-body-base-semibold-font-weight)',
      ...style,
    }}
  >
    {children}
  </button>
);

export default PreviewButton;
