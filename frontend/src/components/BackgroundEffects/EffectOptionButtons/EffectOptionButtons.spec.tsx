import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EffectOptionButtons from './EffectOptionButtons';

describe('EffectOptionButtons', () => {
  it('renders all effect options', () => {
    render(<EffectOptionButtons backgroundSelected="none" setBackgroundSelected={() => {}} />);
    expect(screen.getByTestId('BlockIcon')).toBeInTheDocument();
    expect(screen.getAllByTestId('BlurOnIcon')).toHaveLength(2);
  });

  it('marks the selected option as selected', () => {
    render(<EffectOptionButtons backgroundSelected="low-blur" setBackgroundSelected={() => {}} />);
    const selectedOption = screen.getByRole('button', { selected: true });
    expect(selectedOption).toBeInTheDocument();
  });

  it('calls setBackgroundSelected when an option is clicked', async () => {
    const setBackgroundSelected = vi.fn();
    render(
      <EffectOptionButtons
        backgroundSelected="none"
        setBackgroundSelected={setBackgroundSelected}
      />
    );
    const blurButtons = screen.getAllByRole('button');
    await userEvent.click(blurButtons[1]);
    expect(setBackgroundSelected).toHaveBeenCalledWith('low-blur');
  });

  it('calls setBackgroundSelected with "high-blur" when high blur option is clicked', async () => {
    const setBackgroundSelected = vi.fn();
    render(
      <EffectOptionButtons
        backgroundSelected="none"
        setBackgroundSelected={setBackgroundSelected}
      />
    );
    const blurButtons = screen.getAllByRole('button');
    await userEvent.click(blurButtons[2]);
    expect(setBackgroundSelected).toHaveBeenCalledWith('high-blur');
  });
});
