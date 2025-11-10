import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Popper from './index';

describe('Popper', () => {
  it('renders correctly when open', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    render(
      <Popper open anchorEl={anchorElement}>
        <div data-testid="popper-content">Test content</div>
      </Popper>
    );

    expect(screen.getByTestId('popper-content')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();

    document.body.removeChild(anchorElement);
  });

  it('does not render when closed', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    render(
      <Popper open={false} anchorEl={anchorElement}>
        <div data-testid="hidden-content">Hidden content</div>
      </Popper>
    );

    expect(screen.queryByTestId('hidden-content')).not.toBeInTheDocument();

    document.body.removeChild(anchorElement);
  });

  it('renders with different placements', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    const { rerender } = render(
      <Popper open anchorEl={anchorElement} placement="top">
        <div data-testid="top-popper">Top placement</div>
      </Popper>
    );

    expect(screen.getByTestId('top-popper')).toBeInTheDocument();

    rerender(
      <Popper open anchorEl={anchorElement} placement="bottom">
        <div data-testid="bottom-popper">Bottom placement</div>
      </Popper>
    );

    expect(screen.getByTestId('bottom-popper')).toBeInTheDocument();

    document.body.removeChild(anchorElement);
  });

  it('applies custom sx props', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    render(
      <Popper open anchorEl={anchorElement} sx={{ zIndex: 9999 }} data-testid="styled-popper">
        <div>Styled popper content</div>
      </Popper>
    );

    const popper = screen.getByTestId('styled-popper');
    expect(popper).toBeInTheDocument();

    document.body.removeChild(anchorElement);
  });

  it('handles modifiers', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    const modifiers = [
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ];

    render(
      <Popper open anchorEl={anchorElement} modifiers={modifiers}>
        <div data-testid="modified-popper">Modified popper</div>
      </Popper>
    );

    expect(screen.getByTestId('modified-popper')).toBeInTheDocument();

    document.body.removeChild(anchorElement);
  });

  it('handles keepMounted prop', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    render(
      <Popper open={false} anchorEl={anchorElement} keepMounted>
        <div data-testid="kept-mounted">Kept mounted content</div>
      </Popper>
    );

    expect(screen.getByTestId('kept-mounted')).toBeInTheDocument();
    document.body.removeChild(anchorElement);
  });
});
