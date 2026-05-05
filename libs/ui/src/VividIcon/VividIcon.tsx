import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { createElement } from 'react';
import type { CSSProperties, ReactElement } from 'react';

export type VividIconProps = Record<string, unknown> & {
  name: string;
  customSize: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
  style?: CSSProperties;
};

const VividIcon = ({ name, customSize, style, ...props }: VividIconProps): ReactElement => {
  return createElement('vwc-icon', {
    ref: captureRefComponent,
    size: customSize,
    name,
    'data-testid': `vivid-icon-${name}`,
    style,
    ...props,
  });
};

function captureRefComponent(element: HTMLElement | null) {
  if (!element || hasMediaProcessorSupport()) return;

  void customElements.whenDefined('vwc-icon').then(() => {
    const elementWithShadow = element as HTMLElement & { shadowRoot: ShadowRoot | null };
    const figure = elementWithShadow.shadowRoot?.querySelector('figure');

    if (!figure) return;

    figure.style.paddingLeft = '1px';
    figure.style.paddingRight = '1px';
  });
}

export default VividIcon;
