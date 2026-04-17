import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import CollapsibleSection from './CollapsibleSection';

describe('CollapsibleSection', () => {
  it('renders collapsed by default and keeps the content mounted', () => {
    render(
      <CollapsibleSection title="Publisher statistics">
        <div>Packets sent</div>
      </CollapsibleSection>
    );

    const toggleButton = screen.getByRole('button', { name: /publisher statistics/i });
    const content = screen.getByText(/packets sent/i);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(content).toBeInTheDocument();
    expect(content).not.toBeVisible();
  });

  it('shows and hides the content without unmounting it', async () => {
    const user = userEvent.setup();

    render(
      <CollapsibleSection title="Publisher statistics" defaultExpanded>
        <div>Packets sent</div>
      </CollapsibleSection>
    );

    const toggleButton = screen.getByRole('button', { name: /publisher statistics/i });
    const content = screen.getByText(/packets sent/i);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(content).toBeVisible();

    await user.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(content).toBeInTheDocument();
    expect(content).not.toBeVisible();

    await user.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(content).toBeVisible();
  });
});
