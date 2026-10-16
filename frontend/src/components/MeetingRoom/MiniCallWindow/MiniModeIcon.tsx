import { ReactElement } from 'react';
import useIconSvg from './useIconSvg';

export type MiniModeIconProps = {
  /** Vivid icon name, e.g. `microphone-solid`. */
  name: string;
  /** CSS color for the icon (defaults to `currentColor`). */
  color?: string;
  /** Pixel size of the square icon. */
  size?: number;
  /** Extra tailwind/utility classes for the root element. */
  className?: string;
};

/**
 * Renders a Vivid icon as inline SVG inside the Picture-in-Picture window.
 *
 * The PiP document is a separate realm that does **not** inherit the opener's
 * custom-element registry, so the `<vwc-icon>` web component never upgrades
 * there. This component fetches the same SVG sprites the web component uses
 * and renders them as inline `<svg>` content, which works in any document.
 *
 * @security The SVG source is the trusted Vonage CDN and icon names are
 * hardcoded, so `dangerouslySetInnerHTML` is an acceptable rendering path here.
 * Browsers do not execute `<script>` injected via `innerHTML`, and the CDN
 * serves static `image/svg+xml` content.
 *
 * @param {MiniModeIconProps} props - Icon name, color, and size
 * @returns {ReactElement} Inline SVG icon
 */
const MiniModeIcon = ({
  name,
  color = 'currentColor',
  size = 20,
  className,
}: MiniModeIconProps): ReactElement => {
  const svgContent = useIconSvg(name);

  return (
    <div
      className={className}
      data-testid={`mini-mode-icon-${name}`}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        color,
      }}
      // The SVG comes from the trusted Vonage CDN (VIVID icon set) and icon
      // names are hardcoded constants — no user-supplied HTML is ever injected.
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default MiniModeIcon;
