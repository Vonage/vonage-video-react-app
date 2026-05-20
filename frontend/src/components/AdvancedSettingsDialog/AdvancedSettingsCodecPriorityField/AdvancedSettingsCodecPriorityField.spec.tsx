import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsCodecPriorityField from './AdvancedSettingsCodecPriorityField';

describe('AdvancedSettingsCodecPriorityField', () => {
  it('reorders codecs through drag and drop', () => {
    const setCodecPriority = vi.fn();

    render(
      <AdvancedSettingsCodecPriorityField
        codecPriority={['vp9', 'vp8', 'h264']}
        setCodecPriority={setCodecPriority}
      />
    );

    const vp9Item = screen.getByTestId('advanced-settings-codec-priority-item-vp9');
    const h264Item = screen.getByTestId('advanced-settings-codec-priority-item-h264');

    fireEvent.dragStart(vp9Item);
    fireEvent.dragOver(h264Item);
    fireEvent.drop(h264Item);

    expect(setCodecPriority).toHaveBeenCalledWith(['vp8', 'h264', 'vp9']);
  });

  it('renders the codec labels in SDK order by default', () => {
    render(
      <AdvancedSettingsCodecPriorityField
        codecPriority={['vp9', 'vp8', 'h264']}
        setCodecPriority={vi.fn()}
      />
    );

    const codecItems = within(screen.getByTestId('advanced-settings-codec-priority-list'))
      .getAllByRole('listitem')
      .map((item) => item.textContent);

    expect(codecItems).toEqual(expect.arrayContaining(['1VP9', '2VP8', '3H.264']));
  });
});
