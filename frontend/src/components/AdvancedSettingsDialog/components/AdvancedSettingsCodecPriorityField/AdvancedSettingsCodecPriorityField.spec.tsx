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

  it('reorders codecs with the move buttons, so the control works without a pointer', () => {
    const setCodecPriority = vi.fn();

    render(
      <AdvancedSettingsCodecPriorityField
        codecPriority={['vp9', 'vp8', 'h264']}
        setCodecPriority={setCodecPriority}
      />
    );

    screen.getByRole('button', { name: 'Move VP9 down' }).click();
    expect(setCodecPriority).toHaveBeenCalledWith(['vp8', 'vp9', 'h264']);

    screen.getByRole('button', { name: 'Move H.264 up' }).click();
    expect(setCodecPriority).toHaveBeenCalledWith(['vp9', 'h264', 'vp8']);
  });

  it('disables the moves that would fall off either end of the list', () => {
    render(
      <AdvancedSettingsCodecPriorityField
        codecPriority={['vp9', 'vp8', 'h264']}
        setCodecPriority={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Move VP9 up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move H.264 down' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move VP8 up' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Move VP8 down' })).toBeEnabled();
  });

  it('scopes its test ids to the given prefix so two instances can coexist', () => {
    render(
      <AdvancedSettingsCodecPriorityField
        codecPriority={['vp9', 'vp8', 'h264']}
        setCodecPriority={vi.fn()}
        idPrefix="screen-share-codec-priority"
      />
    );

    expect(screen.getByTestId('screen-share-codec-priority-list')).toBeInTheDocument();
    expect(screen.getByTestId('screen-share-codec-priority-item-vp9')).toBeInTheDocument();
    expect(screen.getByTestId('screen-share-codec-priority-move-down-vp9')).toBeInTheDocument();
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
