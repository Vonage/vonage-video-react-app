import { render as renderBase, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, PropsWithChildren, ReactElement } from 'react';
import useUserContext from '@hooks/useUserContext';
import useAudioOutputContext from '@hooks/useAudioOutputContext';
import { nativeDevices } from '@utils/mockData/device';
import { makeAppConfigProviderWrapper } from '@test/providers';
import composeProviders from '@common/helpers/composeProviders';
import RoomProvider from '../RoomProvider';
import { UserContextType } from '../user';
import { AudioOutputContextType } from '../AudioOutputProvider';
import SuspenseBoundary from '@common/components/SuspenseBoundary/SuspenseBoundary';

vi.mock('@hooks/useUserContext');
vi.mock('@hooks/useAudioOutputContext');
vi.mock('../BackgroundPublisherProvider', () => ({
  __esModule: true,
  BackgroundPublisherProvider: ({ children }: PropsWithChildren) => children,
}));

const fakeName = 'Tommy Traddles';
const fakeAudioOutput = 'their-device-id';

const mockUserContextWithDefaultSettings = {
  user: { defaultSettings: { name: fakeName } },
} as UserContextType;
const mockUseAudioOutputContextValues = {
  currentAudioOutputDevice: fakeAudioOutput,
} as AudioOutputContextType;

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

  it('renders content', async () => {
    const TestComponent = () => <div data-testid="test-component">Test Component</div>;

    await render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route path="/test">
            <Route
              index
              element={
                <RoomProvider>
                  <TestComponent />
                </RoomProvider>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('provides context values to child components', async () => {
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

    await render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route path="/test">
            <Route
              index
              element={
                <RoomProvider>
                  <TestComponent />
                </RoomProvider>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-name').textContent).toBe(fakeName);
    expect(screen.getByTestId('audio-output').textContent).toBe(fakeAudioOutput);
  });
});

async function render(ui: ReactElement) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper();

  const composeWrapper = composeProviders(SuspenseBoundary, AppConfigWrapper);

  let result: ReturnType<typeof renderBase>;

  await act(() => {
    result = renderBase(ui, { wrapper: composeWrapper });
    return Promise.resolve();
  });

  return result!;
}
