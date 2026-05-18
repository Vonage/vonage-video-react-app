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

    const details = screen.getByText(/publisher statistics/i).closest('details');

    const content = screen.getByText(/packets sent/i);

    expect(details).not.toHaveAttribute('open');
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

    const summary = screen.getByText(/publisher statistics/i);
    const details = summary.closest('details');

    const content = screen.getByText(/packets sent/i);

    expect(details).toHaveAttribute('open');
    expect(content).toBeVisible();

    await user.click(summary);

    expect(details).not.toHaveAttribute('open');
    expect(content).toBeInTheDocument();
    expect(content).not.toBeVisible();

    await user.click(summary);

    expect(details).toHaveAttribute('open');
    expect(content).toBeVisible();
  });
});
