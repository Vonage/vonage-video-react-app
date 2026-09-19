import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MiniCallWindow from './MiniCallWindow';

describe('MiniCallWindow', () => {
  it('renders the badge, name, and control buttons', () => {
    const onExpand = vi.fn();
    const onLeave = vi.fn();
    const onToggleAudio = vi.fn();
    const onToggleVideo = vi.fn();

    render(
      <MiniCallWindow
        participant={{ element: null, name: 'Maya Adeyemi', initials: 'MA' }}
        hostedElement={null}
        isAudioEnabled
        isVideoEnabled={false}
        onToggleAudio={onToggleAudio}
        onToggleVideo={onToggleVideo}
        onExpand={onExpand}
        onLeave={onLeave}
      />
    );

    expect(screen.getByTestId('mini-call-window')).toBeVisible();
    expect(screen.getByText('Maya Adeyemi')).toBeVisible();

    screen.getByTestId('mini-mode-mute').click();
    screen.getByTestId('mini-mode-camera').click();
    screen.getByTestId('mini-mode-expand').click();
    screen.getByTestId('mini-mode-leave').click();

    expect(onToggleAudio).toHaveBeenCalledOnce();
    expect(onToggleVideo).toHaveBeenCalledOnce();
    expect(onExpand).toHaveBeenCalledOnce();
    expect(onLeave).toHaveBeenCalledOnce();
  });
});
