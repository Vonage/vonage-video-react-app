import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Publisher } from '@vonage/client-sdk-video';
import { EventEmitter } from 'stream';
import ScreenSharePublisher from './ScreenSharePublisher';
import { defaultAudioDevice } from '../../../utils/mockData/device';

describe('ScreenSharePublisher component', () => {
  it('renders nothing if box is undefined', () => {
    const { container } = render(
      <ScreenSharePublisher box={undefined} element={undefined} publisher={null} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders VideoTile with ScreenShareNameDisplay and appends element with classes', () => {
    const box = { height: 100, width: 100, top: 0, left: 0 };
    const mockPublisher = Object.assign(new EventEmitter(), {
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
      applyAudioFilter: vi.fn(),
      clearAudioFilter: vi.fn(),
      getAudioSource: () => defaultAudioDevice,
      getAudioFilter: () => null,
      videoWidth: () => 1280,
      videoHeight: () => 720,
      stream: { name: 'Test Stream' },
    }) as unknown as Publisher;

    // Create a dummy element to append (simulate HTMLElement)
    const element = document.createElement('div');
    element.className = 'original-class';

    render(<ScreenSharePublisher box={box} element={element} publisher={mockPublisher} />);

    expect(screen.getByText('Test Stream')).toBeInTheDocument();
    expect(element.classList).toContain('w-full');
    expect(element.classList).toContain('absolute');
    expect(element.classList).toContain('rounded-xl');
    expect(element.classList).toContain('object-contain');
  });
});
