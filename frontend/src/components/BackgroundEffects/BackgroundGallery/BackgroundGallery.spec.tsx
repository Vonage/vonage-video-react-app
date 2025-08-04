import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BackgroundGallery, { backgrounds } from './BackgroundGallery';

describe('BackgroundGallery', () => {
  const backgroundsFiles = backgrounds.map((bg) => bg.file);

  it('renders all background images as selectable options', () => {
    render(<BackgroundGallery backgroundSelected="" setBackgroundSelected={() => {}} />);
    const imgs = screen.getAllByRole('img');
    backgroundsFiles.forEach((file) => {
      expect(imgs.some((img) => (img as HTMLImageElement).src.includes(file))).toBe(true);
    });
    const options = backgrounds.map((bg) => screen.getByTestId(`background-${bg.id}`));
    expect(options).toHaveLength(backgroundsFiles.length);
  });

  it('sets the selected background', async () => {
    const setBackgroundSelected = vi.fn();
    render(
      <BackgroundGallery backgroundSelected="" setBackgroundSelected={setBackgroundSelected} />
    );
    const duneViewOption = screen.getByTestId('background-bg3');
    await userEvent.click(duneViewOption);
    expect(setBackgroundSelected).toHaveBeenCalledWith('dune-view.jpg');
  });

  it('marks the background as selected', () => {
    render(<BackgroundGallery backgroundSelected="plane.jpg" setBackgroundSelected={() => {}} />);
    const planeOption = screen.getByTestId('background-bg7');
    expect(planeOption?.getAttribute('aria-pressed')).toBe('true');
  });
});
