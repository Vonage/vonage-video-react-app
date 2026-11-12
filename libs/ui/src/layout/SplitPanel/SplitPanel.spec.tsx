import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SplitPanel from './SplitPanel';

describe('SplitPanel', () => {
  it('places named slots in their layout positions regardless of child order', () => {
    const { container } = render(
      <SplitPanel>
        <SplitPanel.Right>Meeting times</SplitPanel.Right>
        <SplitPanel.Left>Countdown</SplitPanel.Left>
      </SplitPanel>
    );

    expect(container.firstChild).toHaveTextContent('CountdownMeeting times');
    expect(screen.getByText('Countdown').parentElement).toBe(
      screen.getByText('Meeting times').parentElement
    );
  });
});
