import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import VividIcon from './VividIcon';

beforeAll(() => {
  if (!customElements.get('vwc-icon')) {
    class MockVwcIcon extends HTMLElement {
      static get observedAttributes() {
        return ['name', 'size'];
      }

      connectedCallback() {
        this.updateContent();
      }

      attributeChangedCallback() {
        this.updateContent();
      }

      updateContent() {
        const name = this.getAttribute('name') || '';
        const size = this.getAttribute('size') || '0';
        this.innerHTML = `<span data-name="${name}" data-size="${size}">icon-${name}</span>`;
      }
    }
    customElements.define('vwc-icon', MockVwcIcon);
  }
});

describe('VividIcon', () => {
  it('renders with correct name and size', () => {
    render(<VividIcon name="globe-line" customSize={-2} />);

    const icon = screen.getByTestId('vivid-icon-globe-line');
    expect(icon).toBeInTheDocument();

    const nameElement = icon.querySelector('[data-name="globe-line"]');
    const sizeElement = icon.querySelector('[data-size="-2"]');

    expect(nameElement).not.toBeNull();
    expect(sizeElement).not.toBeNull();
  });

  it('generates correct data-testid for different icons', () => {
    const icons = ['flag-united-kingdom', 'translate-line', 'location-line'];

    icons.forEach((iconName) => {
      const { unmount } = render(<VividIcon name={iconName} customSize={0} />);
      expect(screen.getByTestId(`vivid-icon-${iconName}`)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles all valid size ranges', () => {
    const sizes = [-6, -1, 0, 3, 5] as const;

    sizes.forEach((size) => {
      const { unmount } = render(<VividIcon name="test" customSize={size} />);
      const icon = screen.getByTestId('vivid-icon-test');
      const sizeElement = icon.querySelector(`[data-size="${size}"]`);
      expect(sizeElement).not.toBeNull();
      unmount();
    });
  });

  it('updates when props change', () => {
    const { rerender } = render(<VividIcon name="update-test" customSize={0} />);

    let icon = screen.getByTestId('vivid-icon-update-test');
    let sizeElement = icon.querySelector('[data-size="0"]');
    expect(sizeElement).not.toBeNull();

    rerender(<VividIcon name="update-test" customSize={3} />);

    icon = screen.getByTestId('vivid-icon-update-test');
    sizeElement = icon.querySelector('[data-size="3"]');
    expect(sizeElement).not.toBeNull();
  });

  it('passes attributes to vwc-icon element', () => {
    render(<VividIcon name="attribute-test" customSize={-1} />);

    const vwcIcon = screen.getByTestId('vivid-icon-attribute-test').closest('vwc-icon');
    expect(vwcIcon).toHaveAttribute('name', 'attribute-test');
    expect(vwcIcon).toHaveAttribute('size', '-1');
    expect(vwcIcon).toHaveAttribute('data-testid', 'vivid-icon-attribute-test');
  });
});
