import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import type { SxProps, Theme } from '@mui/material';
import { createElement, CSSProperties } from 'react';

interface VividIconProps extends Record<string, unknown> {
  name: string;
  customSize: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
  sx?: SxProps<Theme>;
  style?: CSSProperties;
}

/**
 * VividIcon Component
 * A component that displays a Vivid icon with customizable size.
 * @param {VividIconProps} props - The props for the component.
 * @property {string} name - The name of the icon to display.
 * @property {number} customSize - The size of the icon, ranging from -6 to 5. -6 is the smallest and 5 is the largest.
 * @property {string} className - Additional CSS class names to apply to the icon.
 * @property {SxProps<Theme>} sx - MUI sx prop for styling (converted to inline styles).
 * @property {CSSProperties} style - Inline styles.
 * @returns {React.ReactElement} The rendered VividIcon component.
 */
const VividIcon = ({ name, customSize, className, sx, style, ...props }: VividIconProps) => {
  const convertedStyle = convertSxToStyle(sx, style);

  return createElement('vwc-icon', {
    ref: captureRefComponent,
    size: customSize,
    name,
    'data-testid': `vivid-icon-${name}`,
    className,
    style: convertedStyle,
    ...props,
  });
};

function convertSxToStyle(sx?: SxProps<Theme>, style?: CSSProperties): CSSProperties | undefined {
  if (!sx && !style) return undefined;

  let convertedSx: CSSProperties = {};

  if (sx && typeof sx === 'object' && !Array.isArray(sx)) {
    convertedSx = sx as CSSProperties;
  }

  return {
    ...convertedSx,
    ...style,
  };
}

function captureRefComponent(element: HTMLElement | null) {
  if (!element || hasMediaProcessorSupport()) return;

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
