import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import usePushToTalk from '../usePushToTalk';

type FixtureProps = { enabled: boolean; onToggle: () => void; initialAudioEnabled?: boolean };

const PushToTalkFixture = ({ enabled, onToggle, initialAudioEnabled = false }: FixtureProps) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(initialAudioEnabled);

  const toggleAudio = () => {
    onToggle();
    setIsAudioEnabled((prev) => !prev);
  };

  usePushToTalk({ enabled, isAudioEnabled, toggleAudio });
  return null;
};

describe('usePushToTalk', () => {
  it('does nothing when disabled', () => {
    const onToggle = vi.fn();
    render(<PushToTalkFixture enabled={false} onToggle={onToggle} />);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })
      );
      globalThis.dispatchEvent(
        new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true })
      );
    });

    expect(onToggle).not.toHaveBeenCalled();
  });

  it('unmutes on Space down and mutes on Space up when enabled', () => {
    const onToggle = vi.fn();
    render(<PushToTalkFixture enabled={true} onToggle={onToggle} />);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })
      );
    });
    expect(onToggle).toHaveBeenCalledTimes(1);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true })
      );
    });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('ignores auto-repeat keydown while Space is held', () => {
    const onToggle = vi.fn();
    render(<PushToTalkFixture enabled={true} onToggle={onToggle} />);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })
      );
    });
    expect(onToggle).toHaveBeenCalledTimes(1);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, repeat: true })
      );
    });
    expect(onToggle).toHaveBeenCalledTimes(1);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true })
      );
    });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it('ignores Space events originating from text-entry elements', () => {
    const onToggle = vi.fn();
    render(<PushToTalkFixture enabled={true} onToggle={onToggle} />);

    const input = document.createElement('input');
    document.body.appendChild(input);

    try {
      act(() => {
        input.dispatchEvent(
          new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })
        );
        input.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true }));
      });

      expect(onToggle).not.toHaveBeenCalled();
    } finally {
      input.remove();
    }
  });

  it('does not mute on keyup if mic was already unmuted before Space press', () => {
    const onToggle = vi.fn();
    render(<PushToTalkFixture enabled={true} onToggle={onToggle} initialAudioEnabled={true} />);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })
      );
    });
    expect(onToggle).toHaveBeenCalledTimes(0);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true })
      );
    });
    expect(onToggle).toHaveBeenCalledTimes(0);
  });

  it('resets state when disabled while holding Space', () => {
    const onToggle = vi.fn();
    const { rerender } = render(<PushToTalkFixture enabled={true} onToggle={onToggle} />);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })
      );
    });
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(<PushToTalkFixture enabled={false} onToggle={onToggle} />);
    rerender(<PushToTalkFixture enabled={true} onToggle={onToggle} />);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true })
      );
    });
    expect(onToggle).toHaveBeenCalledTimes(1);

    act(() => {
      globalThis.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true })
      );
    });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
