import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ButtonGroup from './index';
import Button from '../Button';

describe('ButtonGroup', () => {
  it('renders correctly', () => {
    render(
      <ButtonGroup data-testid="button-group">
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </ButtonGroup>
    );

    const buttonGroup = screen.getByTestId('button-group');
    expect(buttonGroup).toBeInTheDocument();
    expect(buttonGroup).toHaveClass('MuiButtonGroup-root');

    expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Second' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Third' })).toBeInTheDocument();
  });

  it('handles button interactions', () => {
    const handleFirst = vi.fn();
    const handleSecond = vi.fn();

    render(
      <ButtonGroup>
        <Button onClick={handleFirst}>First</Button>
        <Button onClick={handleSecond}>Second</Button>
      </ButtonGroup>
    );

    const firstButton = screen.getByRole('button', { name: 'First' });
    const secondButton = screen.getByRole('button', { name: 'Second' });

    fireEvent.click(firstButton);
    expect(handleFirst).toHaveBeenCalledTimes(1);

    fireEvent.click(secondButton);
    expect(handleSecond).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <ButtonGroup variant="contained" data-testid="contained-group">
        <Button>Contained 1</Button>
        <Button>Contained 2</Button>
      </ButtonGroup>
    );

    const buttonGroup = screen.getByTestId('contained-group');
    expect(buttonGroup).toHaveClass('MuiButtonGroup-contained');

    rerender(
      <ButtonGroup variant="outlined" data-testid="outlined-group">
        <Button>Outlined 1</Button>
        <Button>Outlined 2</Button>
      </ButtonGroup>
    );

    const outlinedGroup = screen.getByTestId('outlined-group');
    expect(outlinedGroup).toHaveClass('MuiButtonGroup-outlined');
  });

  it('renders with different colors', () => {
    render(
      <ButtonGroup color="primary" data-testid="primary-group">
        <Button>Primary 1</Button>
        <Button>Primary 2</Button>
      </ButtonGroup>
    );

    const buttonGroup = screen.getByTestId('primary-group');
    expect(buttonGroup).toBeInTheDocument();
  });

  it('renders with different orientations', () => {
    render(
      <ButtonGroup orientation="vertical" data-testid="vertical-group">
        <Button>Top</Button>
        <Button>Middle</Button>
        <Button>Bottom</Button>
      </ButtonGroup>
    );

    const buttonGroup = screen.getByTestId('vertical-group');
    expect(buttonGroup).toHaveClass('MuiButtonGroup-vertical');
  });

  it('renders with single button', () => {
    render(
      <ButtonGroup>
        <Button>Single Button</Button>
      </ButtonGroup>
    );

    expect(screen.getByRole('button', { name: 'Single Button' })).toBeInTheDocument();
  });

  it('renders as different HTML elements', () => {
    render(
      <ButtonGroup component="nav" data-testid="nav-group">
        <Button>Nav 1</Button>
        <Button>Nav 2</Button>
      </ButtonGroup>
    );

    const buttonGroup = screen.getByTestId('nav-group');
    expect(buttonGroup.tagName).toBe('NAV');
  });
});
