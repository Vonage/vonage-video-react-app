/* eslint-disable react/button-has-type */
import { describe, it, expect } from 'vitest';
import { act, render, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import UserProvider, { UserType } from '../user';
import useUserContext from '../../hooks/useUserContext';

const TestComponent = () => {
  const { user, setUser } = useUserContext();
  const setUserClickHandler = () => {
    if (setUser) {
      setUser((prevUserSettings: UserType) => ({
        ...prevUserSettings,
        defaultSettings: {
          ...prevUserSettings.defaultSettings,
          name: 'XXXX',
        },
      }));
    }
  };

  return (
    <div>
      <span data-testid="username">{user.defaultSettings.name}</span>
      <button data-testid="update-username" onClick={setUserClickHandler}>
        Update Username
      </button>
    </div>
  );
};

describe('UserContext', () => {
  it('should be initialized with default values', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <UserProvider>{children}</UserProvider>
    );
    const expectedUser = {
      defaultSettings: {
        publishAudio: true,
        publishVideo: true,
        name: '',
        blur: false,
        noiseSuppression: false,
        audioSource: undefined,
        videoSource: undefined,
        publishCaptions: true,
      },
      issues: {
        reconnections: 0,
        audioFallbacks: 0,
      },
    };

    const { result } = renderHook(() => useUserContext(), { wrapper });
    const { user, setUser } = result.current;

    expect(user).toEqual(expectedUser);
    expect(typeof setUser).toBe('function');
  });

  it('should be able to update the user', () => {
    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Username can be in localStorage, otherwise it's a UUID with shape User-utcDateTime.
    expect(getByTestId('username')).not.toBe('XXXX');

    act(() => {
      getByTestId('update-username').click();
    });

    expect(getByTestId('username')).toHaveTextContent('XXXX');
  });
});
