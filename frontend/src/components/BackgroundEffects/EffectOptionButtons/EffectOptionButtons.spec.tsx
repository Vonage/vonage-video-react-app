import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EffectOptionButtons from './EffectOptionButtons';

describe('EffectOptionButtons', () => {
  it('renders all effect options', () => {
    render(
      <EffectOptionButtons
        backgroundSelected="none"
        setBackgroundSelected={() => {}}
        customBackgroundImageChange={() => {}}
      />
    );
    expect(screen.getByTestId('BlockIcon')).toBeInTheDocument();
    expect(screen.getAllByTestId('BlurOnIcon')).toHaveLength(2);
  });

  it('marks the selected option as selected', () => {
    render(
      <EffectOptionButtons
        backgroundSelected="low-blur"
        setBackgroundSelected={() => {}}
        customBackgroundImageChange={() => {}}
      />
    );
    const selectedOption = screen.getByTestId('background-low-blur');
    expect(selectedOption).toBeInTheDocument();
  });

  it('sets the selected background', async () => {
    const setBackgroundSelected = vi.fn();
    render(
      <EffectOptionButtons
        backgroundSelected="none"
        setBackgroundSelected={setBackgroundSelected}
        customBackgroundImageChange={() => {}}
      />
    );
    const lowBlur = screen.getByTestId('background-low-blur');
    await userEvent.click(lowBlur);
    expect(setBackgroundSelected).toHaveBeenCalledWith('low-blur');
  });

  it('sets the selected background with high blur', async () => {
    const setBackgroundSelected = vi.fn();
    render(
      <EffectOptionButtons
        backgroundSelected="none"
        setBackgroundSelected={setBackgroundSelected}
        customBackgroundImageChange={() => {}}
      />
    );
    const highBlur = screen.getByTestId('background-high-blur');
    await userEvent.click(highBlur);
    expect(setBackgroundSelected).toHaveBeenCalledWith('high-blur');
  });
});
