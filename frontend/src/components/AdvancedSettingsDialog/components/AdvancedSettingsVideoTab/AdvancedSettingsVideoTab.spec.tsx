import { render as renderBase, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { advancedSettings } from '@Context/AdvancedSettings';
import advancedSettings$ from '@Context/AdvancedSettings';
import { testIds as customVideoBitrateTestIds } from '../AdvancedSettingsCustomVideoBitrateField/AdvancedSettingsCustomVideoBitrateField';
import AdvancedSettingsVideoTab from './AdvancedSettingsVideoTab';
import { AdvancedSettingsScreenSharingTab } from '../AdvancedSettingsScreenSharingTab';

type RenderOptions = {
  dialogState?: Partial<advancedSettings>;
};

describe('AdvancedSettingsVideoTab', () => {
  afterEach(() => {
    advancedSettings$.reset();
  });

  it('toggles self-view mirroring and the stats overlay through the store', () => {
    render(<AdvancedSettingsVideoTab />);

    expect(advancedSettings$.getState().selfViewMirroringEnabled).toBe(true);
    screen.getByTestId('advanced-settings-video-self-view-mirroring').click();
    expect(advancedSettings$.getState().selfViewMirroringEnabled).toBe(false);

    const statsOverlayBefore = advancedSettings$.getState().videoStatsOverlayEnabled;
    screen.getByTestId('advanced-settings-video-stats-overlay').click();
    expect(advancedSettings$.getState().videoStatsOverlayEnabled).toBe(!statsOverlayBefore);
  });

  it('renders the Screen Sharing section with its own Optimize for control', () => {
    render(<AdvancedSettingsScreenSharingTab />);

    const screenSharingSection = screen.getByTestId('advanced-settings-screen-sharing-tab');

    expect(screenSharingSection).toBeInTheDocument();
    const screenShareContentHint = within(screenSharingSection).getByTestId(
      'advanced-settings-video-screen-share-content-hint'
    );
    expect(screenShareContentHint).toHaveValue('detail');
    expect(
      [...(screenShareContentHint as HTMLSelectElement).options].map((option) => option.value)
    ).toEqual(['', 'motion', 'detail', 'text']);
  });

  it('defaults every screen-share constraint to the browser default, so shares stay unconstrained', () => {
    render(<AdvancedSettingsScreenSharingTab />);

    const screenSharingSection = screen.getByTestId('advanced-settings-screen-sharing-tab');

    expect(
      within(screenSharingSection).getByTestId('advanced-settings-video-screen-share-frame-rate')
    ).toHaveValue('default-sdk');
    expect(
      within(screenSharingSection).getByTestId('advanced-settings-video-screen-share-resolution')
    ).toHaveValue('default-sdk');
    expect(
      within(screenSharingSection).getByTestId('advanced-settings-video-screen-share-bitrate')
    ).toHaveValue('default-sdk');
    expect(screen.queryByTestId(customVideoBitrateTestIds.slider)).not.toBeInTheDocument();
  });

  it('offers the camera its own Optimize for control, without the screen-only text option', () => {
    render(<AdvancedSettingsVideoTab />);

    const cameraSection = screen.getByTestId('advanced-settings-video-camera-section');
    const cameraContentHint = within(cameraSection).getByTestId(
      'advanced-settings-video-camera-content-hint'
    );

    expect(cameraContentHint).toHaveValue('');
    expect(
      [...(cameraContentHint as HTMLSelectElement).options].map((option) => option.value)
    ).toEqual(['', 'motion', 'detail']);
  });
});

function render(ui: ReactElement, { dialogState }: RenderOptions = {}) {
  if (dialogState) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  return renderBase(ui);
}
