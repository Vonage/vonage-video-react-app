import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SettingsSection from '.';

describe('SettingsSection', () => {
  it('renders the title as a heading alongside its children', () => {
    render(
      <SettingsSection title="Camera" data-testid="camera-section">
        <button type="button" data-testid="frame-rate-control" />
      </SettingsSection>
    );

    expect(screen.getByTestId('camera-section')).toBeInTheDocument();
    expect(screen.getByTestId('settings-section-title')).toBeInTheDocument();
    expect(screen.getByTestId('frame-rate-control')).toBeInTheDocument();
  });

  it('renders the icon and description only when they are given', () => {
    const { rerender } = render(<SettingsSection title="Screen Sharing" />);

    expect(screen.queryByTestId('section-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('settings-section-description')).not.toBeInTheDocument();

    rerender(
      <SettingsSection
        title="Screen Sharing"
        icon={<span data-testid="section-icon" />}
        description="Applies to content you share."
      />
    );

    expect(screen.getByTestId('section-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-section-description')).toBeInTheDocument();
  });

  it('forwards className and DOM props to the root element', () => {
    render(<SettingsSection title="Camera" className="mt-4" data-testid="camera-section" />);

    expect(screen.getByTestId('camera-section')).toHaveClass('mt-4');
  });
});
