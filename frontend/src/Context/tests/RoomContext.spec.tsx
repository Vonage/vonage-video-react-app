import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PropsWithChildren } from 'react';
import useUserContext from '@hooks/useUserContext';
import useAudioOutputContext from '@hooks/useAudioOutputContext';
import { nativeDevices } from '@utils/mockData/device';
import { mergeAppConfigs } from '@Context/AppConfig';
import RoomContext from '../RoomContext';
import { UserContextType } from '../user';
import { AudioOutputContextType } from '../AudioOutputProvider';

vi.mock('@hooks/useUserContext');
vi.mock('@hooks/useAudioOutputContext');
vi.mock('../BackgroundPublisherProvider', () => ({
  __esModule: true,
  BackgroundPublisherProvider: ({ children }: PropsWithChildren) => children,
}));

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

const defaultAppConfigValue = mergeAppConfigs({
  isAppConfigLoaded: true,
});

describe('RoomContext', () => {
  const nativeMediaDevices = global.navigator.mediaDevices;
  beforeEach(() => {
    vi.mocked(useUserContext).mockImplementation(() => mockUserContextWithDefaultSettings);
    vi.mocked(useAudioOutputContext).mockImplementation(() => mockUseAudioOutputContextValues);

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
          <Route path="/test" element={<RoomContext appConfigValue={defaultAppConfigValue} />}>
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
          <Route path="/test" element={<RoomContext appConfigValue={defaultAppConfigValue} />}>
            <Route index element={<TestComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-name').textContent).toBe(fakeName);
    expect(screen.getByTestId('audio-output').textContent).toBe(fakeAudioOutput);
  });
});
