import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsCodecPriorityField from './AdvancedSettingsCodecPriorityField';

describe('AdvancedSettingsCodecPriorityField', () => {
  it('reorders codecs when dragging downward, dropping the codec at the target position', () => {
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

    // Dropping vp9 onto h264 lands vp9 at h264's position. The pre-fix code was off-by-one on
    // downward drags and produced ['vp8', 'h264', 'vp9'] (one slot too far).
    expect(setCodecPriority).toHaveBeenCalledWith(['vp8', 'vp9', 'h264']);
  });

  it('reorders codecs when dragging upward (unaffected by the off-by-one)', () => {
    const setCodecPriority = vi.fn();

    render(
      <AdvancedSettingsCodecPriorityField
        codecPriority={['vp9', 'vp8', 'h264']}
        setCodecPriority={setCodecPriority}
      />
    );

    const vp9Item = screen.getByTestId('advanced-settings-codec-priority-item-vp9');
    const h264Item = screen.getByTestId('advanced-settings-codec-priority-item-h264');

    fireEvent.dragStart(h264Item);
    fireEvent.dragOver(vp9Item);
    fireEvent.drop(vp9Item);

    expect(setCodecPriority).toHaveBeenCalledWith(['h264', 'vp9', 'vp8']);
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
