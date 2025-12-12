import { UserType } from '@Context/user';

/**
 * Default user fixture for testing.
 * Provides a complete user object with sensible defaults.
 */
export const defaultUserFixture: UserType = {
  defaultSettings: {
    publishAudio: true,
    publishVideo: true,
    name: 'Test User',
    noiseSuppression: true,
    publishCaptions: true,
    backgroundFilter: undefined,
    audioSource: undefined,
    videoSource: undefined,
  },
  issues: {
    reconnections: 0,
    audioFallbacks: 0,
  },
  initials: 'TU',
};

/**
 * User fixture with audio/video disabled.
 */
export const mutedUserFixture: UserType = {
  ...defaultUserFixture,
  defaultSettings: {
    ...defaultUserFixture.defaultSettings,
    publishAudio: false,
    publishVideo: false,
  },
};

/**
 * User fixture with custom device sources.
 */
export const userWithDevicesFixture: UserType = {
  ...defaultUserFixture,
  defaultSettings: {
    ...defaultUserFixture.defaultSettings,
    audioSource: 'test-audio-device-id',
    videoSource: 'test-video-device-id',
  },
};

/**
 * User fixture with background blur enabled.
 */
export const userWithBackgroundBlurFixture: UserType = {
  ...defaultUserFixture,
  defaultSettings: {
    ...defaultUserFixture.defaultSettings,
    backgroundFilter: {
      type: 'backgroundBlur',
      blurStrength: 'high',
    },
  },
};

/**
 * User fixture with issues (reconnections/audio fallbacks).
 */
export const userWithIssuesFixture: UserType = {
  ...defaultUserFixture,
  issues: {
    reconnections: 3,
    audioFallbacks: 2,
  },
};

/**
 * Creates a custom user fixture by merging with defaults.
 * @param overrides - Partial user object to override defaults
 * @returns Complete user fixture
 */
export function createUserFixture(overrides: Partial<UserType> = {}): UserType {
  return {
    ...defaultUserFixture,
    ...overrides,
    defaultSettings: {
      ...defaultUserFixture.defaultSettings,
      ...overrides.defaultSettings,
    },
    issues: {
      ...defaultUserFixture.issues,
      ...overrides.issues,
    },
  };
}
