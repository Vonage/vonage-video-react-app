import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SettingsSection from '.';

describe('SettingsSection', () => {
  it('renders the title as a heading alongside its children', () => {
    render(
      <SettingsSection title="Camera">
        <button type="button">Frame rate</button>
      </SettingsSection>
    );

    expect(screen.getByRole('heading', { name: 'Camera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Frame rate' })).toBeInTheDocument();
  });

  it('renders the icon and description only when they are given', () => {
    const { rerender } = render(<SettingsSection title="Screen Sharing" />);

    expect(screen.queryByTestId('section-icon')).not.toBeInTheDocument();
    expect(screen.queryByText('Applies to content you share.')).not.toBeInTheDocument();

    rerender(
      <SettingsSection
        title="Screen Sharing"
        icon={<span data-testid="section-icon" />}
        description="Applies to content you share."
      />
    );

    expect(screen.getByTestId('section-icon')).toBeInTheDocument();
    expect(screen.getByText('Applies to content you share.')).toBeInTheDocument();
  });

  it('forwards className and DOM props to the root element', () => {
    render(<SettingsSection title="Camera" className="mt-4" data-testid="camera-section" />);

    expect(screen.getByTestId('camera-section')).toHaveClass('mt-4');
  });
});
