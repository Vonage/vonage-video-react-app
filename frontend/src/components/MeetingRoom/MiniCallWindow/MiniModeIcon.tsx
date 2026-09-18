import { ReactElement, useEffect, useState } from 'react';

const VIVID_ICON_BASE_URL = 'https://icon.resources.vonage.com/v4.11.0';

const iconSvgCache = new Map<string, string>();

const loadIconSvg = async (name: string): Promise<string> => {
  const cached = iconSvgCache.get(name);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${VIVID_ICON_BASE_URL}/${name}.svg`);
  if (!response.ok) {
    throw new Error(`Failed to load Vivid icon: ${name}`);
  }
  const svgText = await response.text();
  iconSvgCache.set(name, svgText);
  return svgText;
};

export type MiniModeIconProps = {
  /** Vivid icon name, e.g. `microphone-solid`. */
  name: string;
  /** CSS color for the icon (defaults to `currentColor`). */
  color?: string;
  /** Pixel size of the square icon. */
  size?: number;
};

/**
 * Renders a Vivid icon as inline SVG inside the Picture-in-Picture window.
 *
 * The PiP document is a separate realm that does **not** inherit the opener's
 * custom-element registry, so the `<vwc-icon>` web component never upgrades
 * there. This component fetches the same SVG sprites the web component uses
 * and renders them as inline `<svg>` content, which works in any document.
 * @param {MiniModeIconProps} props - Icon name, color, and size
 * @returns {ReactElement} Inline SVG icon
 */
const MiniModeIcon = ({
  name,
  color = 'currentColor',
  size = 20,
}: MiniModeIconProps): ReactElement => {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    let cancelled = false;

    void loadIconSvg(name)
      .then((svg) => {
        if (!cancelled) {
          setSvgContent(svg);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSvgContent('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [name]);

  return (
    <div
      data-testid={`mini-mode-icon-${name}`}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        color,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default MiniModeIcon;
