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
    // Check there are as many items as backgroundsFiles
    const options = backgrounds.map((bg) => screen.getByTestId(`background-${bg.id}`));
    expect(options).toHaveLength(backgroundsFiles.length);
  });

  it('calls setBackgroundSelected when an option is clicked', async () => {
    const setBackgroundSelected = vi.fn();
    render(
      <BackgroundGallery backgroundSelected="" setBackgroundSelected={setBackgroundSelected} />
    );
    const duneViewOption = screen.getByTestId('background-bg3');
    await userEvent.click(duneViewOption);
    expect(setBackgroundSelected).toHaveBeenCalledWith('dune-view.jpg');
  });

  it('marks the selected background as selected', () => {
    render(
      <BackgroundGallery backgroundSelected="hogwarts.jpg" setBackgroundSelected={() => {}} />
    );
    const hogwartsOption = screen.getByTestId('background-bg4');
    expect(hogwartsOption.getAttribute('aria-pressed')).toBe('true');
  });
});
