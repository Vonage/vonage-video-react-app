import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import advancedSettings$ from '@Context/AdvancedSettings';
import { ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE } from '../../schemas';
import AdvancedSettingsScreenSharingTab from './AdvancedSettingsScreenSharingTab';

describe('AdvancedSettingsScreenSharingTab', () => {
  afterEach(() => {
    advancedSettings$.reset();
  });

  it('renders the screen share surface dropdown with monitor selected by default', () => {
    render(<AdvancedSettingsScreenSharingTab />);

    const surfaceSelect = screen.getByTestId('advanced-settings-video-screen-share-surface');
    expect(surfaceSelect).toBeInTheDocument();
    expect(surfaceSelect).toHaveValue(ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE.monitor);
  });

  it('updates the store when screen share surface is changed', async () => {
    expect.assertions(2);

    const user = userEvent.setup();
    render(<AdvancedSettingsScreenSharingTab />);

    const surfaceSelect = screen.getByTestId('advanced-settings-video-screen-share-surface');

    await user.selectOptions(surfaceSelect, ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE.browser);

    expect(surfaceSelect).toHaveValue(ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE.browser);
    expect(advancedSettings$.getState().screenShareSurface).toBe(
      ADVANCED_SETTINGS_SCREEN_SHARE_SURFACE.browser
    );
  });

  it('renders all screen sharing controls', () => {
    render(<AdvancedSettingsScreenSharingTab />);

    expect(screen.getByTestId('advanced-settings-video-screen-share-surface')).toBeInTheDocument();
    expect(
      screen.getByTestId('advanced-settings-video-screen-share-content-hint')
    ).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-video-screen-share-codec')).toBeInTheDocument();
    expect(
      screen.getByTestId('advanced-settings-video-screen-share-frame-rate')
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('advanced-settings-video-screen-share-resolution')
    ).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-video-screen-share-bitrate')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-video-scalable-screenshare')).toBeInTheDocument();
  });

  it('toggles scalable screenshare through the store', async () => {
    expect.assertions(2);

    const user = userEvent.setup();
    render(<AdvancedSettingsScreenSharingTab />);

    const scalableScreenshareToggle = screen.getByTestId(
      'advanced-settings-video-scalable-screenshare'
    );

    expect(advancedSettings$.getState().scalableScreenshareEnabled).toBe(false);

    await user.click(scalableScreenshareToggle);

    expect(advancedSettings$.getState().scalableScreenshareEnabled).toBe(true);
  });
});

function render(ui: ReactElement) {
  return renderBase(ui);
}
