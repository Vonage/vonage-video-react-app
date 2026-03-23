import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import type { CSSProperties, HTMLAttributes, ReactElement } from 'react';
import { createElement } from 'react';
import type { SxProps, Theme } from '@mui/material';

export type VividIconProps = HTMLAttributes<HTMLElement> & {
  name: string;
  customSize: -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;
  sx?: SxProps<Theme>;
  style?: CSSProperties;
};

const VividIcon = ({
  name,
  customSize,
  className,
  sx,
  style,
  ...iconProps
}: VividIconProps): ReactElement => {
  const convertedStyle = convertSxToStyle({ sx, style });

  return createElement('vwc-icon', {
    ref: captureRefComponent,
    className,
    name,
    size: customSize,
    style: convertedStyle,
    'data-testid': `vivid-icon-${name}`,
    ...iconProps,
  });
};

function convertSxToStyle({
  sx,
  style,
}: {
  sx?: SxProps<Theme>;
  style?: CSSProperties;
}): CSSProperties | undefined {
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
    const elementWithShadowRoot = element as HTMLElement & { shadowRoot: ShadowRoot | null };
    const figure = elementWithShadowRoot.shadowRoot?.querySelector('figure');

    if (!figure) return;

    figure.style.paddingLeft = '1px';
    figure.style.paddingRight = '1px';
  });
}

export default VividIcon;
