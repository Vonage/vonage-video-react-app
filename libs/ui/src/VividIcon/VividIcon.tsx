import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { createElement, type CSSProperties } from 'react';

export type VividIconProps = {
  name: string;
  customSize?: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
  /**
   * Use `style` instead. Tailwind classes cannot reach Vivid's internal shadow DOM,
   * so color set via `className` will be silently overridden by MUI and never applied.
   * @deprecated
   */
  className?: never;
  /**
   * Use `style` instead. MUI `sx` is being removed from this codebase.
   * VividIcon accepts `style` directly — pass CSS vars there.
   * @deprecated
   */
  sx?: never;
  style?: CSSProperties;
} & Record<string, unknown>;

const VividIcon = ({ name, customSize, style, ...props }: VividIconProps) => {
  return createElement('vwc-icon', {
    ref: captureRefComponent,
    size: customSize,
    name,
    'data-testid': `vivid-icon-${name}`,
    style: {
      color: 'var(--vera-text-secondary)',
      ...style,
    },
    ...props,
  });
};

function captureRefComponent(element: HTMLElement | null) {
  if (!element || hasMediaProcessorSupport('both')) return;

  void customElements.whenDefined('vwc-icon').then(() => {
    const elementWithShadow = element as HTMLElement & { shadowRoot: ShadowRoot | null };
    const figure = elementWithShadow.shadowRoot?.querySelector('figure');
    if (figure) {
      figure.style.paddingLeft = '1px';
      figure.style.paddingRight = '1px';
    }
  });
}

export default VividIcon;
