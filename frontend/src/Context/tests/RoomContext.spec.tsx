import { render as renderBase, screen } from '@testing-library/react';
import type { MediaDeviceInfoJSON } from '@web/types';
import { Route, Routes } from 'react-router-dom';
import MemoryRouter from '@test/RouterWrapper';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, ReactElement } from 'react';
import { nativeDevices } from '@utils/mockData/device';
import composeProviders from '@web/helpers/composeProviders';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import useUserContext from '@hooks/useUserContext';

const fakeName = 'Tommy Traddles';

describe('RoomContext', () => {
  const nativeMediaDevices = global.navigator.mediaDevices;

  beforeEach(() => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn(
          () =>
            new Promise<MediaDeviceInfoJSON[]>((res) => {
              res(nativeDevices);
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
            <Route index element={<TestComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('provides context values to child components', async () => {
    const TestComponent = () => {
      const { user } = useUserContext();

      return (
        <div>
          <div data-testid="user-name">{user.defaultSettings.name}</div>
        </div>
      );
    };

    await render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route path="/test">
            <Route index element={<TestComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-name').textContent).toBe(fakeName);
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
};

async function render(ui: ReactElement, { userContext }: RenderOptions = {}) {
  const { wrapper: MainWrapper, ...context } = makeTestProvider([providers.user], {
    userContext: {
      value: {
        ...userContext?.value,
        defaultSettings: {
          publishAudio: true,
          publishVideo: true,
          name: fakeName,
          noiseSuppression: false,
          audioSource: undefined,
          videoSource: undefined,
          publishCaptions: true,
          ...userContext?.value?.defaultSettings,
        },
      },
      ...userContext,
    },
  });

  const wrapper = composeProviders(SuspenseBoundary, MainWrapper);

  let result: ReturnType<typeof renderBase>;

  await act(() => {
    result = renderBase(ui, { wrapper });
    return Promise.resolve();
  });

  return {
    ...context,
    ...result!,
  };
}
