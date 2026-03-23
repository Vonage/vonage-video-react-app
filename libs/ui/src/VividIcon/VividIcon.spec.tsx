import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import VividIcon from './VividIcon';

beforeAll(() => {
  if (customElements.get('vwc-icon')) {
    return;
  }

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
});

describe('VividIcon', () => {
  it('renders with correct name and size', () => {
    render(<VividIcon customSize={-2} name="globe-line" />);

    const icon = screen.getByTestId('vivid-icon-globe-line');
    expect(icon).toBeInTheDocument();
    expect(icon.closest('vwc-icon')).toHaveAttribute('name', 'globe-line');
    expect(icon.closest('vwc-icon')).toHaveAttribute('size', '-2');
  });

  it('merges style props from sx and style', () => {
    render(
      <VividIcon
        customSize={0}
        name="style-test"
        style={{ paddingLeft: '2px' }}
        sx={{ color: 'rgb(1, 2, 3)' }}
      />
    );

    const icon = screen.getByTestId('vivid-icon-style-test');
    expect(icon).toHaveStyle({ color: 'rgb(1, 2, 3)', paddingLeft: '2px' });
  });
});
