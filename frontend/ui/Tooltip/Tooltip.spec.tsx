import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  it('renders correctly', () => {
    render(
      <Tooltip title="Helpful tooltip">
        <button type="button">Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Helpful tooltip' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Hover me');
  });

  it('shows tooltip on hover', async () => {
    render(
      <Tooltip title="This is a tooltip">
        <button type="button">Hover target</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'This is a tooltip' });

    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    expect(screen.getByText('This is a tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip title="Disappearing tooltip">
        <button type="button">Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Disappearing tooltip' });

    fireEvent.mouseEnter(button);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(button);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('renders with different placements', async () => {
    const { rerender } = render(
      <Tooltip title="Top placement" placement="top">
        <button type="button">Top tooltip</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Top placement' });
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    rerender(
      <Tooltip title="Bottom placement" placement="bottom">
        <button type="button">Bottom tooltip</button>
      </Tooltip>
    );

    const bottomButton = screen.getByRole('button', { name: 'Bottom placement' });
    fireEvent.mouseEnter(bottomButton);

    await waitFor(() => {
      expect(screen.getByText('Bottom placement')).toBeInTheDocument();
    });
  });
});
