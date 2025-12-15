import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { createElement } from 'react';

interface VividIconProps extends Record<string, unknown> {
  name: string;
  customSize: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
}

/**
 * VividIcon Component
 * A component that displays a Vivid icon with customizable size.
 * @param {VividIconProps} props - The props for the component.
 * @property {string} name - The name of the icon to display.
 * @property {number} customSize - The size of the icon, ranging from -6 to 5. -6 is the smallest and 5 is the largest.
 * @property {string} className - Additional CSS class names to apply to the icon.
 * @returns {React.ReactElement} The rendered VividIcon component.
 */
const VividIcon = ({ name, customSize, className, ...props }: VividIconProps) => {
  return createElement('vwc-icon', {
    ref: captureRefComponent,
    size: customSize,
    name,
    'data-testid': `vivid-icon-${name}`,
    className,
    ...props,
  });
};

function captureRefComponent(element: HTMLElement | null) {
  if (!element || hasMediaProcessorSupport()) return;

  customElements.whenDefined('vwc-icon').then(() => {
    const elementWithShadow = element as HTMLElement & { shadowRoot: ShadowRoot | null };
    const figure = elementWithShadow.shadowRoot?.querySelector('figure');
    if (figure) {
      figure.style.paddingLeft = '1px';
      figure.style.paddingRight = '1px';
    }
  });
}

export default VividIcon;
