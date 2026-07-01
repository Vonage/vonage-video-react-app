import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { ComponentProps, createElement } from 'react';
import { twMerge } from 'tailwind-merge';

export type VividIconProps = {
  name: string;
  customSize?: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
} & ComponentProps<'div'>;

const VividIcon = ({ name, customSize, className, ...props }: VividIconProps) => {
  return createElement('vwc-icon', {
    ref: captureRefComponent,
    size: customSize,
    name,
    'data-testid': `vivid-icon-${name}`,
    className: twMerge('text-vera-secondary', className),
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
