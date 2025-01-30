import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import RoomContext from '../RoomContext';
import useUserContext from '../../hooks/useUserContext';
import { UserContextType } from '../user';
import useAudioOutputContext from '../../hooks/useAudioOutputContext';
import { AudioOutputContextType } from '../AudioOutputProvider';
import { nativeDevices } from '../../utils/mockData/device';

vi.mock('../../hooks/useUserContext');
vi.mock('../../hooks/useAudioOutputContext');

const mockUseUserContext = useUserContext as Mock<[], UserContextType>;
const mockUseAudioOutputContext = useAudioOutputContext as Mock<[], AudioOutputContextType>;

const fakeName = 'Tommy Traddles';
const fakeAudioOutput = 'their-device-id';

const mockUserContextWithDefaultSettings = {
  user: {
    defaultSettings: {
      name: fakeName,
    },
  },
} as UserContextType;
const mockUseAudioOutputContextValues = {
  currentAudioOutputDevice: fakeAudioOutput,
} as AudioOutputContextType;

mockUseUserContext.mockImplementation(() => mockUserContextWithDefaultSettings);
mockUseAudioOutputContext.mockImplementation(() => mockUseAudioOutputContextValues);

describe('RoomContext', () => {
  const nativeMediaDevices = global.navigator.mediaDevices;
  beforeEach(() => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn(
          () =>
            new Promise<MediaDeviceInfo[]>((res) => {
              res(nativeDevices as MediaDeviceInfo[]);
            })
        ),
        addEventListener: vi.fn(() => []),
        removeEventListener: vi.fn(() => []),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: nativeMediaDevices,
    });
  });

  it('renders content', () => {
    const TestComponent = () => <div data-testid="test-component">Test Component</div>;

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route path="/test" element={<RoomContext />}>
            <Route index element={<TestComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('provides context values to child components', () => {
    const TestComponent = () => {
      const { user } = useUserContext();
      const { currentAudioOutputDevice } = useAudioOutputContext();

      return (
        <div>
          <div data-testid="user-name">{user.defaultSettings.name}</div>
          <div data-testid="audio-output">{currentAudioOutputDevice}</div>
        </div>
      );
    };

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route path="/test" element={<RoomContext />}>
            <Route index element={<TestComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-name').textContent).toBe(fakeName);
    expect(screen.getByTestId('audio-output').textContent).toBe(fakeAudioOutput);
  });
});
